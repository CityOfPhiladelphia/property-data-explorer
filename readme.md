# Property Reboot

Updated application for property.phila.gov

## Dev Setup
Prerequisites:
* Node 10 -- Recommended to use nvm to manage your node installations
* Yarn 


1. Update the fortawesome repository in your local .npmrc file: 
```
  Dan-Lopezs-MacBook-Pro:property-bulk danlopez$ npm config set "@fortawesome:registry" https://npm.fontawesome.com/
  Dan-Lopezs-MacBook-Pro:property-bulk danlopez$ npm config set "//npm.fontawesome.com/:_authToken" AUTH_TOKEN
```
* Ask another developer for the authtoken. 
1. Install packages: 
```
$ yarn install
```
1. Run the app in dev mode: 
```
yarn run dev
```

## Deploying
TODO