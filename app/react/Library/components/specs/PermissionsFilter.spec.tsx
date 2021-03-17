import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import SelectFilter from 'app/Library/components/SelectFilter';
import { Aggregations } from 'shared/types/Aggregations';
import { PermissionsFilter } from '../PermissionsFilter';

describe('Permissions Filter', () => {
  let component: ShallowWrapper<typeof PermissionsFilter>;

  const aggregations = {
    all: {
      permissions: {
        buckets: [
          { key: 'read', filtered: { doc_count: 3 } },
          { key: 'write', filtered: { doc_count: 6 } },
        ],
      },
    },
  };

  const render = (aggs: Aggregations = aggregations) => {
    component = shallow(<PermissionsFilter onChange={() => {}} aggregations={aggs} />);
  };

  it('should display the number of entities the user has permissions on', () => {
    render();
    const options = component.find(SelectFilter).prop('options');
    expect(options).toEqual([
      expect.objectContaining({ value: 'write', results: 6 }),
      expect.objectContaining({ value: 'read', results: 3 }),
    ]);
  });
});
