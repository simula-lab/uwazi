import React from 'react';
import Immutable from 'immutable';
import { shallow } from 'enzyme';

import RelationTypesAPI from 'app/RelationTypes/RelationTypesAPI';
import prioritySortingCriteria from 'app/utils/prioritySortingCriteria';
import * as relationships from 'app/Relationships/utils/routeUtils';
import { RequestParams } from 'app/utils/RequestParams';
import * as pageAssetsUtils from 'app/Pages/utils/getPageAssets';

import EntitiesAPI from '../../Entities/EntitiesAPI';
import EntityView from '../EntityView';

describe('EntityView', () => {
  describe('requestState', () => {
    const templates = Immutable.fromJS([{ _id: '1' }, { _id: '2', entityViewPage: 'aViewPage' }]);
    const entities = [
      { _id: 1, sharedId: '123', template: '1' },
      { _id: 2, sharedId: 'abc', template: '2' },
    ];
    const relationTypes = [{ _id: 1, name: 'against' }];

    beforeEach(() => {
      spyOn(EntitiesAPI, 'get').and.callFake(value =>
        Promise.resolve(entities.filter(e => e.sharedId === value.data.sharedId))
      );
      spyOn(RelationTypesAPI, 'get').and.returnValue(Promise.resolve(relationTypes));
      spyOn(prioritySortingCriteria, 'get').and.returnValue({ sort: 'priorized' });
      spyOn(relationships, 'requestState').and.returnValue(
        Promise.resolve(['connectionsGroups', 'searchResults', 'sort', 'filters'])
      );
      spyOn(relationships, 'emptyState').and.returnValue({ type: 'RELATIONSHIPS_EMPTY_STATE' });
      spyOn(relationships, 'setReduxState').and.returnValue({
        type: 'RELATIONSHIPS_SET_REDUX_STATE',
      });
    });

    it('should get the entity, and all connectionsList items', async () => {
      const request = new RequestParams({ sharedId: '123' }, 'headers');
      const actions = await EntityView.requestState(request, { templates });

      expect(relationships.requestState).toHaveBeenCalledWith(request, { templates });
      expect(EntitiesAPI.get).toHaveBeenCalledWith(request);
      expect(RelationTypesAPI.get).toHaveBeenCalledWith({ headers: 'headers' });

      expect(actions).toMatchSnapshot();
    });

    describe('when template has "entityViewPage"', () => {
      beforeEach(() => {
        spyOn(pageAssetsUtils, 'getPageAssets').and.callFake(
          async (query, _additionalDatasets, localDatasets) => {
            expect(query).toEqual({ data: { sharedId: 'aViewPage' }, headers: 'headers' });
            return Promise.resolve({
              pageView: 'pageViewValues',
              itemLists: 'itemListsValue',
              datasets: { ...localDatasets },
            });
          }
        );
      });

      const expectActionSet = (value, storeLocation, expectedValue) => {
        expect(value).toEqual({
          type: `${storeLocation}/SET`,
          value: expectedValue,
        });
      };

      it('should append the "entityRaw" and "template" to the page datasets in the store', async () => {
        const request = new RequestParams({ sharedId: 'abc' }, 'headers');
        const actions = await EntityView.requestState(request, { templates });

        expectActionSet(actions[actions.length - 3], 'page/pageView', 'pageViewValues');
        expectActionSet(actions[actions.length - 2], 'page/itemLists', 'itemListsValue');

        const datasetsActions = actions[actions.length - 1];

        expect(datasetsActions.type).toBe('page/datasets/SET');
        expect(datasetsActions.value.entityRaw).toEqual(entities[1]);
        expect(datasetsActions.value.template).toEqual(templates.get(1));
      });
    });
  });

  describe('unmount', () => {
    it('should unset selected tab and all page-related store keys', () => {
      const context = { store: { dispatch: jasmine.createSpy('dispatch') } };
      const component = shallow(<EntityView />, { context });

      component.unmount();

      expect(context.store.dispatch).toHaveBeenCalledWith({ type: 'RESET_USER_SELECTED_TAB' });
      expect(context.store.dispatch).toHaveBeenCalledWith({ type: 'page/pageView/UNSET' });
      expect(context.store.dispatch).toHaveBeenCalledWith({ type: 'page/itemLists/UNSET' });
      expect(context.store.dispatch).toHaveBeenCalledWith({ type: 'page/datasets/UNSET' });
    });
  });
});
