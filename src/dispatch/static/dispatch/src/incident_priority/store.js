import IncidentPriorityApi from "@/incident_priority/api"

import { getField, updateField } from "vuex-map-fields"
import { debounce } from "lodash"

const getDefaultSelectedState = () => {
  return {
    id: null,
    name: null,
    page_commander: null,
    view_order: null,
    status_reminder: null,
    description: null,
    loading: false
  }
}

const state = {
  selected: {
    ...getDefaultSelectedState()
  },
  dialogs: {
    showCreateEdit: false,
    showRemove: false
  },
  table: {
    rows: {
      items: [],
      total: null
    },
    options: {
      q: "",
      page: 1,
      itemsPerPage: 10,
      sortBy: ["view_order"],
      descending: [false]
    },
    loading: false
  }
}

const getters = {
  getField
}

const actions = {
  getAll: debounce(({ commit, state }) => {
    commit("SET_TABLE_LOADING", true)
    return IncidentPriorityApi.getAll(state.table.options)
      .then(response => {
        commit("SET_TABLE_LOADING", false)
        commit("SET_TABLE_ROWS", response.data)
      })
      .catch(() => {
        commit("SET_TABLE_LOADING", false)
      })
  }, 200),
  createEditShow({ commit }, incidentPriority) {
    commit("SET_DIALOG_CREATE_EDIT", true)
    if (incidentPriority) {
      commit("SET_SELECTED", incidentPriority)
    }
  },
  removeShow({ commit }, incidentPriority) {
    commit("SET_DIALOG_DELETE", true)
    commit("SET_SELECTED", incidentPriority)
  },
  closeCreateEdit({ commit }) {
    commit("SET_DIALOG_CREATE_EDIT", false)
    commit("RESET_SELECTED")
  },
  closeRemove({ commit }) {
    commit("SET_DIALOG_DELETE", false)
    commit("RESET_SELECTED")
  },
  save({ commit, state, dispatch }) {
    if (!state.selected.id) {
      return IncidentPriorityApi.create(state.selected)
        .then(() => {
          dispatch("closeCreateEdit")
          dispatch("getAll")
          commit(
            "app/SET_SNACKBAR",
            { text: "IncidentPriority created successfully." },
            { root: true }
          )
        })
        .catch(err => {
          commit(
            "app/SET_SNACKBAR",
            {
              text: "IncidentPriority not created. Reason: " + err.response.data.detail,
              color: "red"
            },
            { root: true }
          )
        })
    } else {
      return IncidentPriorityApi.update(state.selected.id, state.selected)
        .then(() => {
          dispatch("closeCreateEdit")
          dispatch("getAll")
          commit(
            "app/SET_SNACKBAR",
            { text: "Incident Priority updated successfully." },
            { root: true }
          )
        })
        .catch(err => {
          commit(
            "app/SET_SNACKBAR",
            {
              text: "Incident Priority not updated. Reason: " + err.response.data.detail,
              color: "red"
            },
            { root: true }
          )
        })
    }
  },
  remove({ commit, dispatch }) {
    return IncidentPriorityApi.delete(state.selected.id)
      .then(function() {
        dispatch("closeRemove")
        dispatch("getAll")
        commit(
          "app/SET_SNACKBAR",
          { text: "Incident Priority deleted successfully." },
          { root: true }
        )
      })
      .catch(err => {
        commit(
          "app/SET_SNACKBAR",
          {
            text: "Incident Priority not deleted. Reason: " + err.response.data.detail,
            color: "red"
          },
          { root: true }
        )
      })
  }
}

const mutations = {
  updateField,
  SET_SELECTED(state, value) {
    state.selected = Object.assign(state.selected, value)
  },
  SET_TABLE_LOADING(state, value) {
    state.table.loading = value
  },
  SET_TABLE_ROWS(state, value) {
    state.table.rows = value
  },
  SET_DIALOG_CREATE_EDIT(state, value) {
    state.dialogs.showCreateEdit = value
  },
  SET_DIALOG_DELETE(state, value) {
    state.dialogs.showRemove = value
  },
  RESET_SELECTED(state) {
    state.selected = Object.assign(state.selected, getDefaultSelectedState())
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
