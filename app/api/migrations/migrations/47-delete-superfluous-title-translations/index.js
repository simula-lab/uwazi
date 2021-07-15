/* eslint-disable no-await-in-loop */

export default {
  delta: 47,

  name: 'delete-superfluous-title-translations',

  description:
    'The migration deletes the translations for the template &#x27;title&#x27; common property names that do not exist anymore (have been changed).',

  async up(db) {
    process.stdout.write(`${this.name}...\r\n`);

    const translationCursor = await db.collection('translations').find({});
    while (await translationCursor.hasNext()) {
      const translation = await translationCursor.next();

      await Promise.all(
        translation.contexts.map(async context => {
          if (context.type === 'Entity') {
            const template = await db.collection('templates').findOne({ _id: context.id });

            const templateLabelSet = new Set([
              template.name,
              'Title',
              template.commonProperties.find(p => p.name === 'title').label,
              ...template.properties.map(p => p.label),
            ]);
            context.values = context.values.filter(element => templateLabelSet.has(element.key));
          }
          return Promise.resolve();
        })
      );
      await db.collection('translations').save(translation);
    }
  },
};
