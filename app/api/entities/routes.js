import Joi from 'joi';
import objectId from 'joi-objectid';
import { search } from 'api/search';
import { uploadMiddleware } from 'api/files';
import { saveEntity } from 'api/entities/entityManager';
import entities from './entities';
import templates from '../templates/templates';
import thesauri from '../thesauri/thesauri';
import needsAuthorization from '../auth/authMiddleware';
import { parseQuery, validation } from '../utils';

Joi.objectId = objectId(Joi);

export default app => {
  app.post(
    '/api/entities_with_files',
    needsAuthorization(['admin', 'editor', 'collaborator']),
    uploadMiddleware.multiple(),
    async (req, res, next) => {
      //remove JSON.parse
      try {
        const entityToSave = JSON.parse(req.body.entity);
        const entity = await saveEntity(entityToSave, {
          user: req.user,
          language: req.language,
          files: req.files,
        });
        return res.json(entity);
      } catch (e) {
        return next(e);
      }
    }
  );

  app.post(
    '/api/entities',
    needsAuthorization(['admin', 'editor', 'collaborator']),
    (req, res, next) =>
      entities
        .save(req.body, { user: req.user, language: req.language })
        .then(response => {
          res.json(response);
          return templates.getById(response.template);
        })
        .then(async template =>
          thesauri.templateToThesauri(
            template,
            req.language,
            req.user,
            await search.countPerTemplate(req.language)
          )
        )
        .then(templateTransformed => {
          req.sockets.emitToCurrentTenant('thesauriChange', templateTransformed);
        })
        .catch(next)
  );

  app.post('/api/entity_denormalize', needsAuthorization(['admin', 'editor']), (req, res, next) =>
    entities
      .denormalize(req.body, { user: req.user, language: req.language })
      .then(response => {
        res.json(response);
      })
      .catch(next)
  );

  app.post(
    '/api/entities/multipleupdate',
    needsAuthorization(['admin', 'editor', 'collaborator']),
    (req, res, next) =>
      entities
        .multipleUpdate(req.body.ids, req.body.values, { user: req.user, language: req.language })
        .then(docs => {
          res.json(docs);
        })
        .catch(next)
  );

  app.get(
    '/api/entities/count_by_template',
    validation.validateRequest(
      Joi.object()
        .keys({
          templateId: Joi.objectId().required(),
        })
        .required(),
      'query'
    ),
    (req, res, next) =>
      entities
        .countByTemplate(req.query.templateId)
        .then(response => res.json(response))
        .catch(next)
  );

  app.get(
    '/api/entities/get_raw_page',
    validation.validateRequest(
      Joi.object()
        .keys({
          sharedId: Joi.string().required(),
          pageNumber: Joi.number().required(),
        })
        .required(),
      'query'
    ),
    (req, res, next) =>
      entities
        .getRawPage(req.query.sharedId, req.language, req.query.pageNumber)
        .then(data => res.json({ data }))
        .catch(next)
  );

  app.get(
    '/api/entities',
    parseQuery,
    validation.validateRequest({
      properties: {
        query: {
          properties: {
            sharedId: { type: 'string' },
            _id: { type: 'string' },
            withPdf: { type: 'string' },
            omitRelationships: { type: 'boolean' },
            include: { type: 'array', items: [{ type: 'string', enum: ['permissions'] }] },
          },
        },
      },
    }),
    (req, res, next) => {
      const { omitRelationships, include = [], ...query } = req.query;
      const action = omitRelationships ? 'get' : 'getWithRelationships';
      const published = req.user ? {} : { published: true };
      const language = req.language ? { language: req.language } : {};
      entities[action](
        { ...query, ...published, ...language },
        include.map(field => `+${field}`).join(' '),
        {
          limit: 1,
        }
      )
        .then(_entities => {
          if (!_entities.length) {
            res.status(404);
            res.json({ rows: [] });
            return;
          }
          if (!req.user && _entities[0].relationships) {
            const entity = _entities[0];
            entity.relationships = entity.relationships.filter(rel => rel.entityData.published);
          }
          res.json({ rows: _entities });
        })
        .catch(next);
    }
  );

  app.delete(
    '/api/entities',
    needsAuthorization(['admin', 'editor', 'collaborator']),
    validation.validateRequest(
      Joi.object()
        .keys({
          sharedId: Joi.string().required(),
        })
        .required(),
      'query'
    ),
    (req, res, next) => {
      entities
        .delete(req.query.sharedId)
        .then(response => res.json(response))
        .catch(next);
    }
  );

  app.post(
    '/api/entities/bulkdelete',
    needsAuthorization(['admin', 'editor']),
    validation.validateRequest(
      Joi.object()
        .keys({
          sharedIds: Joi.array()
            .items(Joi.string())
            .required(),
        })
        .required(),
      'body'
    ),
    (req, res, next) => {
      entities
        .deleteMultiple(req.body.sharedIds)
        .then(() => res.json('ok'))
        .catch(next);
    }
  );
};
