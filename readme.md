# Property

Updated application for property.phila.gov

## Dev Setup
Prerequisites:
* Node 10 -- Recommended to use nvm to manage your node installations
* Yarn 


1. Update the fortawesome repository in your local .npmrc file: 
```
  fortawesome:registry=https://npm.fontawesome.com/
  npm.fontawesome.com/:_authToken=[TOKEN]
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

-Open a PR to the main branch. This should trigger the various testing scripts and build test. Once those pass, and review is complete merge into main. 
- Pushing/merging to the main branch should be picked up by GitHub actions and sends to a dev bucket in S3. 
- Changes merged from main into the production branch will be picked up by GitHub actions and sent to the production bucket in S3.  

## Note:
For internal City Of Philadelphia users, find more information at [Property](https://phila.city/display/appdev/Property+Data+Explorer) in phila.city.

## Change log
+ Changes from Feb. 2020 to present.

### 2-20-2020
+ Build and deploy migrated from Travis to gh-actions
This was one of the last GIS apps still using Travis. The migration was done so that all of the Software Engineering apps shared the latest and same build process using gh-actions.
### 2-24-20202
+ CSS Print Change
fix: css changes to avoid using postition absolute bc it causes issues rendering more than one page in browsers such as IE.
### 2-24-2020
+ Additional gh-actions. Added the yml for the production build and deploy actions.
### 2-25-2020
+ Added secrets for prod gh actions
### 2-27-2020
+ Changed zoning sources and changed the opa_properties data to a test db for now. 
### 3-4-2020
+ Added some error handling in the Data Panel to return either the opa acct # or parcel_number depending on the search results. 
### 3-9-2020
+ New OPA data source and division fields. Added new divisions such as ward, school, and polic district info to the data panel. 
+ Changed opa_properties data source from a test db to one specific for property titled "opa_properties_pde"
### 3-30-2020
+ Fix to clear data sources correctly on a shape search. 
### 4-3-2020
+ Property card redesign
- property card moved into left pane
- new button and table comps
- updated dependencies from @Philly to @phila accounts
- other related CSS styling associated with the redesign effort
+ Fix Intro Page Scroll - css change
+ Additiona CSS fixes
### 4-20-2020
+ Fix csv download - changed error handling in the data panel to check for undefined type.
+ CSS changes for beta tag and app title. 
### 4-21-2020
+ Search Result Redesign - changed address in results to link style and changed the clear buttin to text link
### 5-11-2020
+ Button and Sidebar Redesign - Changes include significant design changes to the draw buttons, CSS (style, fonts, placement of various elements), and changes to the links and sidebar navigation. Also included is robust end-to-end testing and improved documentation.
### 7-23-2020
+ Block search added. 
+ Fixed url for the police district link
+ Updated phila-vue dependecies from commits to releases. 

+ Change owner and block ais searches to https 
### 7-24-2020
+ Moved Slack build notifications to MS Teams
### 7-30-2020
+ Update MS Teams Notification and OPA Inquiry Link
### 8-13-2020
+ Update property inquiry links and MS Teams notifications
### 8-24-2020
+ Cyclomedia fix
### 8-25-2020
+ Additional fixes for the last few updates to MS Teams, cyclomedia and https in api calls. 
### 9-16-2020
+ Removed owner search and added messagings regarding the change.
### 10-27-2020
+ Updated property cards links such as tax balance, and additional CSS and rendering handling changes.
### 12-1-2020
+ Add callout for OPA system upgrade
### 12-3-2020
+ Proofing changes in property card
### 1-14-2021
+ Fix: Mailing Address - changed logic to check for a mailing address to display
### 7-13-2021
+ Bug fixes: zoning data check before display, atlas link fix, remove owner search from testing
+ Updated datafetch version
+ merging main to prod after cyclomedia and yarn changes -update pvm dependency version, add appName to store and fix for cyclomedia display
### 7-15-2021
+ merges in main, which uses @phila/vue-mapping 2.2.12, fixing the imagery
### 8-16-2021
+ Adjust keywords for block search
+ fix build error
+ Use packages/dependencies updated to npm from yarn
+ fix atlas zoning link
### 11-16-2021
+ Added local details to property card
+ Updated dependencies of datafectch and mapping
+ Added loading data handling into property card
+ Additional fixes for null value handling
+ Fixes to buffer search
+ Fixes to left panel when cyclomedia active
+ Zoom fix
+ Shape search fix for single result
+ Routing fix on block search
+ Route shows opa number for single address results. 
+ Intersection search fixes
+ bug fixes for csv export
+ bug fix for lot size data field in property card
### 11-23-2021
+ Change feedback form to formstack
### 12-7-2021
+ Changes to release officially as property.phila.gov
### 12-9-2021
+ Remove mesg and link for legacy property
### 12-13-2021
+ Remove beta tag on header and any other beta references
### 1-12-2022
+ Update dependency of mapping to use maplibre
+ Revert previous change
### 1-13-2022
+ Released w/ maplibre and fixes
### 2-8-2022
+ Hide draw and radius tools when data panel expanded. 
+ build actions changes
+ Merges index.html header change into prod for caching clear
+ uses @phila/vue-mapping 3.1.5 which fixes bug with hiding the zoom buttons
### 3-4-2022
+ adds jspdf-autotable to compiled dependencies for ie11
### 3-8-2022
+ merges condo error handling into prod - failed address shows in url, error message does not flash between searches, fixes buffer search
+ upgrade node version
### 5-4-2022
+ Add slight change to the AIS and carto calls to sort the results by address to help when displaying a large number of results or when adding condo units to existing results. 
