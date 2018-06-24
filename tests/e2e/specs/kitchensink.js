// https://docs.cypress.io/api/introduction/api.html

import u from '../support/util'
import data from '../support/kitchensink_data'

const userId = u.uuid()
const user = {
  email: `${userId}@example.com`,
  password: 'admin'
}
const accountName = `Company ${userId}`

function jsonEqual (obj1, obj2) {
  return JSON.stringify(obj1) === JSON.stringify(obj2)
}

const TITLE_FIELD = {
  name: 'Title',
  type: 'string'
}

const Article = Model({
  name: 'Article',
  fields: [
    TITLE_FIELD,
    {
      name: 'Body',
      type: 'text'
    },
    {
      name: 'Author',
      category: 'two-way-relationship',
      relationship: {
        toType: 'author',
        toField: 'articles',
        type: 'many-to-one'
      }
    },
    {
      name: 'Slot',
      category: 'two-way-relationship',
      relationship: {
        toType: 'slot',
        toField: 'article',
        type: 'one-to-one'
      }
    },
    {
      name: 'Categories',
      category: 'two-way-relationship',
      relationship: {
        toType: 'category',
        toField: 'articles',
        type: 'many-to-many'
      }
    },
    {
      name: 'Awesome',
      type: 'boolean'
    },
    {
      name: 'Score',
      type: 'integer'
    }
  ]
})

const Author = Model({
  name: 'Author',
  fields: [
    {
      name: 'Name',
      type: 'string'
    }
  ],
  expectedFields: [
    {
      name: 'Articles',
      category: 'two-way-relationship',
      relationship: {
        type: 'one-to-many',
        toType: 'article',
        toField: 'author'
      }
    }
  ]
})

const Slot = Model({
  name: 'Slot',
  fields: [
    {
      name: 'Name',
      type: 'string'
    }
  ],
  expectedFields: [
    {
      name: 'Article',
      category: 'two-way-relationship',
      relationship: {
        type: 'one-to-one',
        toType: 'article',
        toField: 'slot'
      }
    }
  ]
})

const Category = Model({
  name: 'Category',
  fields: [
    {
      name: 'Name',
      type: 'string'
    }
  ],
  expectedFields: [
    {
      name: 'Articles',
      category: 'two-way-relationship',
      relationship: {
        type: 'many-to-many',
        toType: 'article',
        toField: 'categories'
      }
    }
  ]
})

function Model (model) {
  const modelDefaults = {
    coll: u.dbFriendly(model.name)
  }
  const fieldDefaults = {
    category: 'data',
    type: 'string'
  }
  function fieldsWithDefaults (fields) {
    return (fields || []).map((field) => {
      const key = u.dbFriendly(field.name)
      return Object.assign({key}, fieldDefaults, field)
    })
  }
  return Object.assign({}, modelDefaults, model, {
    fields: fieldsWithDefaults(model.fields),
    expectedFields: fieldsWithDefaults(model.expectedFields)
  })
}

function navigateHome () {
  cy.get('a.navbar-brand').click()
  cy.location('href').should('match', /#\/$/)
}

function saveModelsForm () {
  cy.get('form.models-form input[type="submit"]').last().click()
  cy.get('.alert-success').contains('Saved')
}

function clickNewModel () {
  navigateHome()
  cy.get('.new-model').click()
  cy.location('href').should('match', /#\/models\/new$/)
}

function clickNewData (model) {
  navigateHome()
  cy.get(`tr.models-row.${model.coll} a.new-data`).click({force: true})
  cy.location('href').should('match', new RegExp(`#\/data\/${model.coll}\/new$`))
}

function addModelField (field, index) {
  cy.get('.add-field').click()
  const scope = `.field-${index + 2}`
  cy.get(`${scope} input.field-name`).type(field.name)
  if (field.category === 'data') {
    cy.get(`${scope} select.data-type`).select(field.type)
  } else {
    cy.get(`${scope} input.${field.category}`).click()
  }
  if (field.relationship) {
    const {type, toType, toField} = field.relationship
    if (toType) cy.get(`${scope} input.to-type`).clear().type(toType)
    if (toField) cy.get(`${scope} input.to-field`).clear().type(toField)
    cy.get(`${scope} input.${type}`).click()
  }
}

function createModel (model) {
  clickNewModel()
  cy.get('form input#name').type(model.name);
  const fields = model.fields || []
  if (fields[0] && !jsonEqual(fields[0], TITLE_FIELD)) {
    cy.get(`.field-1 a.expand-field`).click()
    cy.get(`.field-1 input.field-name`).clear().type(fields[0].name)
    cy.get(`.field-1 select.data-type`).select(fields[0].type)
  }
  fields.slice(1).forEach(addModelField)
  saveModelsForm()
  verifyModelCreated(model)
}

function verifyModelCreated (model) {
  navigateHome()
  const fields = u.concat(model.fields, model.expectedFields)

  const scope = `tr.models-row.${model.coll}`
  const expectedFields = fields.filter(f => f.relationship === undefined).map(f => f.name)
  cy.get(`${scope} td.fields`).should('contain', expectedFields.join(', '))
  const expectedRelationships = fields.filter(f => f.relationship !== undefined).map(f => f.name)
  cy.get(`${scope} td.relationships`).should('contain', expectedRelationships.join(', '))

  // NOTE/FIXME: Cypress seems to think the link is not visible so need to use force here, see:
  // https://docs.cypress.io/guides/references/error-messages.html#cy-failed-because-the-element-cannot-be-interacted-with
  cy.get(`${scope} td a.models-edit`).click({force: true})
  cy.location('href').should('match', /#\/models\/[^\/]+\/edit/)
  cy.get(`form.models-form input#name`).should('have.value', model.name)
  cy.get(`form.models-form input#coll`).should('have.value', model.coll)

  fields.forEach((field, index) => {
    const scope = `div.form-group.field-${index + 1}`
    cy.get(`${scope} a.expand-field`).click()
    cy.get(`${scope} input.field-name`).should('have.value', field.name)
    cy.get(`${scope} input.field-key`).should('have.value', field.key)
    if (field.category === 'two-way-relationship') {
      cy.get(`${scope} input.two-way-relationship`).should('be.checked')
    } else if (field.category === 'one-way-relationship') {
      cy.get(`${scope} input.one-way-relationship`).should('be.checked')
    } else {
      cy.get(`${scope} select.data-type option[value="${field.type}"]`).should('be.selected')
    }
    if (field.relationship) {
      cy.get(`${scope} input.to-type`).should('have.value', field.relationship.toType)
      cy.get(`${scope} input.to-field`).should('have.value', field.relationship.toField)
      cy.get(`${scope} input.${field.relationship.type}`).should('be.checked')
    }
  })
}

function createData (model) {
  (data[model.name] || []).forEach((doc, index) => {
    console.log(`createData for model=${model.name} index=${index}`)
    clickNewData(model)
    model.fields.filter(field => doc[field.key]).forEach((field) => {
      const value = doc[field.key]
      const scope = `form.data-form .data-field-${field.key}`
      if (field.category === 'data' && ['string', 'text'].includes(field.type)) {
        // NOTE: needed force here, see: https://on.cypress.io/element-cannot-be-interacted-with
        cy.get(`${scope} .form-control`).type(value, {force: true, delay: 0})
      }
    })
    cy.get(`form.data-form input[type="submit"].save`).first().click()
    cy.location('href').should('match', new RegExp(`/#/data/${model.coll}/[^/]+/edit`))
  })
}

describe('Kitchensink', () => {
  it('Visit homepage and get redirected to login page', () => {
    cy.visit('/')
    cy.location('href').should('match', /#\/login$/)
  })

  it(`Click register link and submit register form with email=${user.email}`, () => {
    cy.get('#register-link').click()
    cy.location('href').should('match', /#\/register$/)

    cy.get('form input#email').type(user.email)
    cy.get('form input#password').type(user.password)
    cy.get('form input#accountName').type(accountName)
    cy.get('form.register-form').submit()
    cy.location('href').should('match', /#\/$/)
  })

  it('Click logout link and log back in again', () => {
    cy.get('a.logout').click()
    cy.location('href').should('match', /#\/login$/)

    cy.get('form input#email').type(user.email)
    cy.get('form input#password').type(user.password)
    cy.get('form.login-form').submit()
    cy.location('href').should('match', /#\/$/)
  })

  it('Check email and company name in Navbar', () => {
    cy.get('.brand').should('contain', accountName)
    cy.get('.user-email').should('contain', user.email)
  })

  it('Create Article model', () => {
    createModel(Article)
  })

  it('Create Author model', () => {
    createModel(Author)
  })

  it('Create Slot model', () => {
    createModel(Slot)
  })

  it('Create Category model', () => {
    createModel(Category)
  })

  it('Create Author data', () => {
    createData(Author)
  })

  it('Create Slot data', () => {
    createData(Slot)
  })

  it('Create Category data', () => {
    createData(Category)
  })

  it('Create Article data', () => {
    createData(Article)
  })
})
