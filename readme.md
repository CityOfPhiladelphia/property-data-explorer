# Property (Beta)

Updated application for property.phila.gov

## Dev Setup
Prerequisites:
* Node 10 -- Recommended to use nvm to manage your node installations
* Yarn 


1. Update the fortawesome repository in your local .npmrc file: 
```
  npm config set "@fortawesome:registry" https://npm.fontawesome.com/
  npm config set "//npm.fontawesome.com/:_authToken" AUTH_TOKEN
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

-Open a PR to the master branch. This should trigger the various testing scripts and build test. Once those pass, and review is complete merge into master. 
- Pushing/merging to the master branch should be picked up by GitHub actions and sends to a dev bucket in S3. 
- Changes merged from master into the production branch will be picked up by GitHub actions and sent to the production bucket in S3.  

## Note:
For internal City Of Philadelphia users, find more information at [Property Data Explorer](https://phila.city/display/appdev/Property+Data+Explorer) in phila.city.
