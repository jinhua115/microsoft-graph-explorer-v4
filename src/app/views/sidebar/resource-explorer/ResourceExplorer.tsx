import {
  Breadcrumb, ChoiceGroup, ContextualMenuItemType, DefaultButton,
  IBreadcrumbItem, IChoiceGroupOption, Icon, INavLink,
  Label, Nav, SearchBox, styled
} from '@fluentui/react';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';

import { IResource } from '../../../../types/resources';
import { IRootState } from '../../../../types/root';
import { filterResourcesByLabel } from '../../../utils/resources/resource-payload-filter';
import { translateMessage } from '../../../utils/translate-messages';
import { classNames } from '../../classnames';
import { sidebarStyles } from '../Sidebar.styles';
import LinkItem from './LinkItem';
import { createList } from './resource-explorer.utils';

const ResourceExplorer = (props: any) => {
  const { resources } = useSelector(
    (state: IRootState) => state
  );
  const classes = classNames(props);
  const { data } = resources;
  const versions: IChoiceGroupOption[] = [
    { key: 'v1.0', text: 'v1.0', iconProps: { iconName: 'CloudWeather' } },
    { key: 'beta', text: 'beta', iconProps: { iconName: 'PartlyCloudyNight' } }
  ];

  const [version, setVersion] = useState(versions[0].key);
  const [searchText, setSearchText] = useState<string>('');

  const filterDataByVersion = (info: IResource, selectedVersion: string) => {
    return filterResourcesByLabel(filterResourcesByLabel(info, ['Prod']), [selectedVersion]);
  }

  const filteredPayload = filterDataByVersion(data, version);
  const [resourceItems, setResourceItems] = useState<IResource[]>(filteredPayload.children);
  const [items, setItems] = useState(createList(resourceItems));
  const [isolated, setIsolated] = useState<any>(null);

  const performSearch = (needle: string, haystack: any[]) => {
    const keyword = needle.toLowerCase();
    return haystack.filter((sample: IResource) => {
      const name = sample.segment.toLowerCase();
      return name.toLowerCase().includes(keyword);
    });
  }

  const generateBreadCrumbs = () => {
    if (!!isolated) {
      const breadcrumbItems: IBreadcrumbItem[] = [];
      isolated.paths.forEach((path: string, index: number) => {
        breadcrumbItems.push({ text: path, key: path + index });
      });
      const { name } = isolated;

      breadcrumbItems.push({ text: name, key: name });
      return breadcrumbItems
    }
    return [];
  }

  const clickLink = (ev?: React.MouseEvent<HTMLElement>, item?: INavLink) => {
    ev!.preventDefault();
    if (item && item.name) {
      alert(item.name + ' link clicked');
    }
  }

  const changeVersion = (ev: React.FormEvent<HTMLElement | HTMLInputElement> | undefined,
    option: IChoiceGroupOption | undefined): void => {
    const selectedVersion = option!.key;
    setVersion(selectedVersion);
    const list = filterDataByVersion(data, selectedVersion);
    const dataSet = (searchText) ? performSearch(searchText, list.children) : list.children;
    setResourceItems(dataSet);
    setItems(createList(dataSet));
  }

  const changeSearchValue = (event: any, value?: string) => {
    let filtered: any[] = [...data.children];
    setSearchText(value || '');
    if (value) {
      filtered = performSearch(value, filtered);
    }
    const dataSet = filterDataByVersion({
      children: filtered,
      label: data.label,
      segment: data.segment
    }, version).children;
    setResourceItems(dataSet);
    setItems(createList(dataSet));
  }

  const navStyles: any = (properties: any) => ({
    chevronIcon: [
      properties.isExpanded && {
        transform: `rotate(0deg)`
      },
      !properties.isExpanded && {
        transform: `rotate(-90deg)`
      }
    ]
  });

  const isolateTree = (navLink: any): void => {
    const tree = [
      {
        isExpanded: false,
        links: navLink.links,
      }
    ];
    setItems(tree);
    setIsolated(navLink);
  }

  const disableIsolation = (): void => {
    setItems(createList(resourceItems));
    setIsolated(null);
  }

  const selectContextItem = (e: any, item: any, link: INavLink) => {
    switch (item.key) {
      case 'isolate':
        isolateTree(link);
        break;

      default:
        alert(`you are clicking '${item.text}' on '${link.name}'`);
        break;
    }
  };
  const renderCustomLink = (properties: any) => {
    const menuItems = [
      {
        key: 'actions',
        itemType: ContextualMenuItemType.Header,
        text: properties.key,
      }
    ];

    if (properties!.links!.length > 0) {
      menuItems.push(
        {
          key: 'isolate',
          text: translateMessage('Isolate'),
          itemType: ContextualMenuItemType.Normal
        });
    }

    return <LinkItem
      style={{
        flexGrow: 1,
        textAlign: 'left',
        boxSizing: 'border-box'
      }}
      key={properties.key}
      items={menuItems}
      onItemClick={(e: any, item: any) => selectContextItem(e, item, properties)}>
      <span style={{ display: 'flex' }}>
        {!!properties.iconProperties && <Icon style={{ margin: '0 4px' }} {...properties.iconProperties} />}
        {properties.name}
      </span>
    </LinkItem>;
  }

  const breadCrumbs = (!!isolated) ? generateBreadCrumbs() : [];

  return (
    <section>
      {!isolated && <>
        <SearchBox
          placeholder={translateMessage('Search resources')}
          onChange={changeSearchValue}
          disabled={!!isolated}
          styles={{ field: { paddingLeft: 10 } }}
        />
        <hr />
        <ChoiceGroup
          label={translateMessage('Select version')}
          defaultSelectedKey={version}
          options={versions}
          onChange={changeVersion}
        />;
      </>}

      {isolated && breadCrumbs.length > 0 &&
        <>
          <DefaultButton
            text={translateMessage('Close isolation')}
            iconProps={{ iconName: 'Back' }}
            onClick={disableIsolation}
          />
          <hr />
          <Breadcrumb
            items={breadCrumbs}
            maxDisplayedItems={3}
            ariaLabel={translateMessage('Path display')}
            overflowAriaLabel={translateMessage('More path links')}
          />
        </>}

      <Label>
        <FormattedMessage id='Resources available' />
      </Label>
      <Nav
        groups={items}
        onLinkClick={clickLink}
        styles={navStyles}
        onRenderLink={renderCustomLink}
        className={classes.queryList} />
    </section>
  );
}

// @ts-ignore
const styledResourceExplorer = styled(ResourceExplorer, sidebarStyles);
export default styledResourceExplorer;
