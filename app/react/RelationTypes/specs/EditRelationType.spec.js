import React from 'react';
import backend from 'fetch-mock';
import {shallow} from 'enzyme';

import {APIURL} from 'app/config.js';
import EditRelationType from 'app/RelationTypes/EditRelationType';
import RelationTypeForm from 'app/RelationTypes/components/RelationTypeForm';
import RouteHandler from 'app/controllers/App/RouteHandler';

describe('EditRelationType', () => {
  let relationType = {name: 'Against'};
  let component;
  let instance;
  let props = jasmine.createSpyObj(['editRelationType']);
  let context;

  beforeEach(() => {
    RouteHandler.renderedFromServer = true;
    context = {store: {dispatch: jasmine.createSpy('dispatch')}};
    component = shallow(<EditRelationType {...props}/>, {context});
    instance = component.instance();

    backend.restore();
    backend
    .mock(APIURL + 'relationtypes?_id=relationTypeId', 'GET', {body: JSON.stringify(relationType)});
  });

  it('should render a RelationTypeForm', () => {
    expect(component.find(RelationTypeForm).length).toBe(1);
  });

  describe('static requestState()', () => {
    it('should request the relationTypes using the param relationTypeId', (done) => {
      EditRelationType.requestState({relationTypeId: 'relationTypeId'})
      .then((state) => {
        expect(state).toEqual({relationType});
        done();
      })
      .catch(done.fail);
    });
  });

  describe('setReduxState()', () => {
    it('should call setTemplates with templates passed', () => {
      instance.setReduxState({relationType});
      expect(context.store.dispatch).toHaveBeenCalledWith({type: 'EDIT_RELATION_TYPE', relationType});
    });
  });
});