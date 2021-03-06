/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */

import { fromJS } from 'immutable'

import {
  LOAD_DASHBOARDS_SUCCESS,
  LOAD_DASHBOARDS_FAILURE,
  ADD_DASHBOARD,
  ADD_DASHBOARD_SUCCESS,
  ADD_DASHBOARD_FAILURE,
  EDIT_DASHBOARD_SUCCESS,
  EDIT_CURRENT_DASHBOARD,
  EDIT_CURRENT_DASHBOARD_SUCCESS,
  EDIT_CURRENT_DASHBOARD_FAILURE,
  DELETE_DASHBOARD_SUCCESS,
  LOAD_DASHBOARD_DETAIL,
  LOAD_DASHBOARD_DETAIL_SUCCESS,
  LOAD_DASHBOARD_DETAIL_FAILURE,
  ADD_DASHBOARD_ITEM_SUCCESS,
  ADD_DASHBOARD_ITEM_FAILURE,
  EDIT_DASHBOARD_ITEM_SUCCESS,
  EDIT_DASHBOARD_ITEM_FAILURE,
  EDIT_DASHBOARD_ITEMS_SUCCESS,
  EDIT_DASHBOARD_ITEMS_FAILURE,
  DELETE_DASHBOARD_ITEM_SUCCESS,
  DELETE_DASHBOARD_ITEM_FAILURE,
  CLEAR_CURRENT_DASHBOARD,
  LOAD_DASHBOARD_SHARE_LINK,
  LOAD_DASHBOARD_SHARE_LINK_SUCCESS,
  LOAD_DASHBOARD_SECRET_LINK_SUCCESS,
  LOAD_DASHBOARD_SHARE_LINK_FAILURE,
  LOAD_WIDGET_SHARE_LINK,
  LOAD_WIDGET_SHARE_LINK_SUCCESS,
  LOAD_WIDGET_SECRET_LINK_SUCCESS,
  LOAD_WIDGET_SHARE_LINK_FAILURE,
  LOAD_WIDGET_CSV,
  LOAD_WIDGET_CSV_SUCCESS,
  LOAD_WIDGET_CSV_FAILURE,
  RENDER_DASHBOARDITEM,
  RESIZE_DASHBOARDITEM,
  RESIZE_ALL_DASHBOARDITEM,
  DRILL_DASHBOARDITEM,
  DELETE_DRILL_HISTORY
} from './constants'

import {
  LOAD_DATA_FROM_ITEM,
  LOAD_DATA_FROM_ITEM_SUCCESS,
  LOAD_DATA_FROM_ITEM_FAILURE,
  LOAD_CASCADESOURCE_SUCCESS
} from '../Bizlogic/constants'

const initialState = fromJS({
  dashboards: null,
  currentDashboard: null,
  currentDashboardLoading: false,
  currentDashboardShareInfo: '',
  currentDashboardSecretInfo: '',
  currentDashboardShareInfoLoading: false,
  currentDashboardCascadeSources: null,
  currentItems: null,
  currentItemsInfo: null,
  modalLoading: false
})

function dashboardReducer (state = initialState, action) {
  const { type, payload } = action
  const dashboards = state.get('dashboards')
  const dashboardCascadeSources = state.get('currentDashboardCascadeSources')
  let items = state.get('currentItems')
  const itemsInfo = state.get('currentItemsInfo')

  switch (type) {
    case LOAD_DASHBOARDS_SUCCESS:
      return state.set('dashboards', payload.dashboards)
    case LOAD_DASHBOARDS_FAILURE:
      return state

    case ADD_DASHBOARD:
      return state.set('modalLoading', true)
    case ADD_DASHBOARD_SUCCESS:
      if (dashboards) {
        dashboards.push(payload.result)
        return state
          .set('dashboards', dashboards.slice())
          .set('modalLoading', false)
      } else {
        return state
          .set('dashboards', [payload.result])
          .set('modalLoading', false)
      }
    case ADD_DASHBOARD_FAILURE:
      return state.set('modalLoading', false)

    case EDIT_DASHBOARD_SUCCESS:
      const { result, formType } = payload
      if (formType === 'edit') {
        result.forEach((r) => {
          dashboards.splice(dashboards.findIndex((d) => d.id === r.id), 1, r)
        })
      } else if (formType === 'move') {
        result.forEach((r) => {
          dashboards.splice(dashboards.findIndex((d) => d.id === r.id), 1)
        })
        Array.prototype.push.apply(dashboards, result)
      }
      return state.set('dashboards', dashboards.slice())
    case EDIT_CURRENT_DASHBOARD:
      return state.set('currentDashboardLoading', true)
    case EDIT_CURRENT_DASHBOARD_SUCCESS:
      return state
        .set('currentDashboard', payload.result)
        .set('currentDashboardCascadeSources', {})
        .set('currentDashboardLoading', false)
    case EDIT_CURRENT_DASHBOARD_FAILURE:
      return state.set('currentDashboardLoading', false)

    case DELETE_DASHBOARD_SUCCESS:
      return state.set('dashboards', dashboards.filter((i) => i.id !== payload.id))

    case LOAD_DASHBOARD_DETAIL:
      return state
        .set('currentDashboardLoading', true)
        .set('currentDashboardShareInfo', '')
        .set('currentDashboardSecretInfo', '')

    case LOAD_DASHBOARD_DETAIL_SUCCESS:
      return state
        .set('currentDashboardLoading', false)
        .set('currentDashboard', payload.dashboardDetail)
        .set('currentDashboardCascadeSources', {})
        .set('currentItems', payload.dashboardDetail.widgets)
        .set('currentItemsInfo', payload.dashboardDetail.widgets.reduce((obj, w) => {
          obj[w.id] = {
            datasource: [],
            loading: false,
            queryParams: {
              linkageFilters: [],
              globalFilters: [],
              params: [],
              linkageParams: [],
              globalParams: [],
              pagination: {}
            },
            shareInfo: '',
            shareInfoLoading: false,
            secretInfo: '',
            downloadCsvLoading: false,
            interactId: '',
            rendered: false,
            renderType: 'rerender'
          }
          return obj
        }, {}))
    case LOAD_DASHBOARD_DETAIL_FAILURE:
      return state.set('currentDashboardLoading', false)

    case ADD_DASHBOARD_ITEM_SUCCESS:
      if (!items) {
        items = []
      }

      const infoTemp = new Object()
      payload.result.forEach((pr) => {
        infoTemp[pr.id] = {
          datasource: [],
          loading: false,
          queryParams: {
            linkageFilters: [],
            globalFilters: [],
            params: [],
            linkageParams: [],
            globalParams: [],
            pagination: {}
          },
          shareInfo: '',
          shareInfoLoading: false,
          secretInfo: '',
          downloadCsvLoading: false,
          interactId: '',
          rendered: false,
          renderType: 'rerender'
        }
      })
      return state
        .set('currentItems', items.concat(payload.result))
        .set('currentItemsInfo', {
          ...itemsInfo,
          ...infoTemp
        })
    case ADD_DASHBOARD_ITEM_FAILURE:
      return state

    case EDIT_DASHBOARD_ITEM_SUCCESS:
      items.splice(items.indexOf(items.find((i) => i.id === payload.result.id)), 1, payload.result)
      return state.set('currentItems', items.slice())
    case EDIT_DASHBOARD_ITEM_FAILURE:
      return state

    case EDIT_DASHBOARD_ITEMS_SUCCESS:
      return state.set('currentItems', payload.items)
    case EDIT_DASHBOARD_ITEMS_FAILURE:
      return state

    case DELETE_DASHBOARD_ITEM_SUCCESS:
      delete itemsInfo[payload.id]
      return state.set('currentItems', items.filter((i) => i.id !== payload.id))
    case DELETE_DASHBOARD_ITEM_FAILURE:
      return state

    case CLEAR_CURRENT_DASHBOARD:
      return state
        .set('currentDashboard', null)
        .set('currentItems', null)
        .set('currentItemsInfo', null)

    case LOAD_DATA_FROM_ITEM:
      return payload.vizType !== 'dashboard' ? state : state
        .set('currentItemsInfo', {
          ...itemsInfo,
          [payload.itemId]: {
            ...itemsInfo[payload.itemId],
            loading: true,
            queryParams: {
              ...itemsInfo[payload.itemId]['queryParams'],
              linkageFilters: payload.params.linkageFilters,
              globalFilters: payload.params.globalFilters,
              params: payload.params.params,
              linkageParams: payload.params.linkageParams,
              globalParams: payload.params.globalParams
            }
          }
        })

    case LOAD_DATA_FROM_ITEM_SUCCESS:
      return payload.vizType !== 'dashboard' ? state : state.set('currentItemsInfo', {
        ...itemsInfo,
        [payload.itemId]: {
          ...itemsInfo[payload.itemId],
          loading: false,
          datasource: payload.data,
          renderType: payload.renderType
        }
      })
    case DRILL_DASHBOARDITEM:
      if (!itemsInfo[payload.itemId]['queryParams']['drillHistory']) {
        itemsInfo[payload.itemId]['queryParams']['drillHistory'] = []
      }
      return state.set('currentItemsInfo', {
        ...itemsInfo,
        [payload.itemId]: {
          ...itemsInfo[payload.itemId],
          queryParams: {
            ...itemsInfo[payload.itemId]['queryParams'],
            drillHistory: itemsInfo[payload.itemId]['queryParams']['drillHistory'].concat(payload.drillHistory)
          }
        }
      })
    case DELETE_DRILL_HISTORY:
      const drillHistoryArray = itemsInfo[payload.itemId]['queryParams']['drillHistory']
      return state.set('currentItemsInfo', {
        ...itemsInfo,
        [payload.itemId]: {
          ...itemsInfo[payload.itemId],
          queryParams: {
            ...itemsInfo[payload.itemId]['queryParams'],
            drillHistory: Array.isArray(drillHistoryArray) ? drillHistoryArray.slice(0, payload.index + 1) : drillHistoryArray
          }
        }
      })
    case LOAD_DATA_FROM_ITEM_FAILURE:
      return payload.vizType !== 'dashboard' ? state : state.set('currentItemsInfo', {
        ...itemsInfo,
        [payload.itemId]: {
          ...itemsInfo[payload.itemId],
          loading: false
        }
      })

    case LOAD_DASHBOARD_SHARE_LINK:
      return state.set('currentDashboardShareInfoLoading', true)
    case LOAD_DASHBOARD_SHARE_LINK_SUCCESS:
      return state
        .set('currentDashboardShareInfo', payload.shareInfo)
        .set('currentDashboardShareInfoLoading', false)
    case LOAD_DASHBOARD_SECRET_LINK_SUCCESS:
      return state
        .set('currentDashboardSecretInfo', payload.secretInfo)
        .set('currentDashboardShareInfoLoading', false)
    case LOAD_DASHBOARD_SHARE_LINK_FAILURE:
      return state.set('currentDashboardShareInfoLoading', false)

    case LOAD_WIDGET_SHARE_LINK:
      return state.set('currentItemsInfo', {
        ...itemsInfo,
        [payload.itemId]: {
          ...itemsInfo[payload.itemId],
          shareInfoLoading: true
        }
      })
    case LOAD_WIDGET_SHARE_LINK_SUCCESS:
      return state
        .set('currentItemsInfo', {
          ...itemsInfo,
          [payload.itemId]: {
            ...itemsInfo[payload.itemId],
            shareInfo: payload.shareInfo,
            shareInfoLoading: false
          }
        })
    case LOAD_WIDGET_SECRET_LINK_SUCCESS:
      return state
        .set('currentItemsInfo', {
          ...itemsInfo,
          [payload.itemId]: {
            ...itemsInfo[payload.itemId],
            secretInfo: payload.shareInfo,
            shareInfoLoading: false
          }
        })
    case LOAD_WIDGET_SHARE_LINK_FAILURE:
      return state.set('currentItemsInfo', {
        ...itemsInfo,
        [payload.itemId]: {
          ...itemsInfo[payload.itemId],
          shareInfoLoading: false
        }
      })

    case LOAD_WIDGET_CSV:
      return state.set('currentItemsInfo', {
        ...itemsInfo,
        [payload.itemId]: {
          ...itemsInfo[payload.itemId],
          downloadCsvLoading: true
        }
      })
    case LOAD_WIDGET_CSV_SUCCESS:
    case LOAD_WIDGET_CSV_FAILURE:
      return state.set('currentItemsInfo', {
        ...itemsInfo,
        [payload.itemId]: {
          ...itemsInfo[payload.itemId],
          downloadCsvLoading: false
        }
      })
    case LOAD_CASCADESOURCE_SUCCESS:
      return state.set('currentDashboardCascadeSources', {
        ...dashboardCascadeSources,
        [payload.controlId]: {
          ...dashboardCascadeSources[payload.controlId],
          [payload.column]: payload.values
        }
      })
    case RENDER_DASHBOARDITEM:
      return state.set('currentItemsInfo', {
        ...itemsInfo,
        [payload.itemId]: {
          ...itemsInfo[payload.itemId],
          rendered: true
        }
      })
    case RESIZE_DASHBOARDITEM:
      return state.set('currentItemsInfo', {
        ...itemsInfo,
        [payload.itemId]: {
          ...itemsInfo[payload.itemId],
          renderType: 'resize',
          datasource: [...itemsInfo[payload.itemId].datasource]
        }
      })
    case RESIZE_ALL_DASHBOARDITEM:
      return state.set(
        'currentItemsInfo',
        Object.entries(itemsInfo).reduce((info, [key, prop]: [string, any]) => {
          info[key] = {
            ...prop,
            renderType: 'resize',
            datasource: [...prop.datasource]
          }
          return info
        }, {})
      )
    default:
      return state
  }
}

export default dashboardReducer
