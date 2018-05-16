# versioned-ui - A CMS Admin UI

## Backlog (Sprint)

* Registration form
  * Create user
  * Login
  * Create account
  * Get user defaultSpace
  What if you register with an account that already exists
  The name should be unique
  An invitation request should be emailed to admins of account

* Try using async/await?

## Epics (Major Features)

## Ice Box (For Later Consideration)

* handle console.log in all browsers?

* slug - An autogenerated url-safe and human-readable identifier for an item

* Handle three API types (options.scope={accountId, scopeId}):
  * spaceId scoped: /v1/data/{spaceId}
  * accountId scoped: /v1/{accountId}/models|spaces
  * Global: /v1/users|accounts|login

* Need account and scope selectors
  Pick first for now. Allow settind users.defaultSpaceId on profile page or keep track of last used?

## Data Types

https://www.contentful.com/developers/docs/concepts/data-model

https://www.contentful.com/developers/docs/concepts/links

* Short text ("Hello World", max 256) - for titles and names. Support sorting and equal filters.
* Long text ("This is a long book...", max 50,000) - for paragraphs of text. Filtererable with search.
* Number (2) - integer
* Number (3.14) - decimal
* Date and time ("2015-11-06T09:45:27") - A date and time in ISO 8601 format
* Location ({"lat": 52.5208, "lon": 13.4049})
* Boolean (true/false)
* Media Link
* Reference Link
* Array
* JSON Object

## Onboarding Process (Adapted from Contentful)

* Signup / Try for free button on homepage
* Form with
  name
  company
  email
  password
* Land on app.versioned.io in selected account
* Create space (should be done automatically)
* Create structure / models
* Create content

https://app.contentful.com/spaces/3qm0py0gmiw8/home

https://app.contentful.com/account/organizations/2yw63mtuIHjOhmiHXCB8Tu/subscription_overview
  Payment details

https://app.contentful.com/account/organizations/2yw63mtuIHjOhmiHXCB8Tu/subscription_overview

Entry/Content Edit
https://app.contentful.com/spaces/3qm0py0gmiw8/entries/2uNOpLMJioKeoMq8W44uYc

Prismic:
  Email
  Password
  Project name (subdomain)

https://marklunds.prismic.io/documents/working/

Select language

npm install -g prismic-cli
prismic init marklunds

## Starting the Development Server

```
yarn install
yarn run dev
open http://localhost:8080
```

To create a production build, run `yarn build`

## Debuggning

User:

```
localStorage.getItem('user')
```

## How this App Was Created

```
npm install -g @vue/cli
vue create versioned-ui
```

## Heroku Deploy

```
heroku config:set VUE_APP_API_URL=https://versioned2.herokuapp.com/v1
```

## Resources

* [vue-cli Documentation](https://github.com/vuejs/vue-cli/blob/dev/docs/README.md)
* [Heroku Deployment](https://wyeworks.com/blog/2018/1/8/how-to-quickly-deploy-a-vuejs-app-to-heroku)
* [Algolia Search JavaScript Client](https://www.algolia.com/doc/api-client/javascript/getting-started)
* [Top 5 Vue Admin Templates](https://ourcodeworld.com/articles/read/699/top-5-best-free-vue-js-admin-templates)
