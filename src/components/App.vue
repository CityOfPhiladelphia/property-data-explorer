<template>
  <div id="app-root">
    <header class="site-header app group">
      <div class="row expanded">
        <div class="columns">
          <a href="//beta.phila.gov" class="logo">
            <img src="https://standards.phila.gov/img/logo/city-of-philadelphia-yellow-white.png" alt="City of Philadelphia">
          </a>
          <div class="app-divide"></div>
          <div class="page-title-container">
            <a href="#/">
              <h1 class="page-title">PVC-PVD Example App</h1>
            </a>
          </div>
        </div>
      </div>
    </header>

    <div id="components-root">


      <div class="floating">

        <map-panel/>


      </div>

      <div class="floating">

        <div class="margin-sides-20 component-label">horizontal-table:</div>

        <horizontal-table
          class="margin-20 medium-10"
          :slots="{
            title: 'Permits',
            items: function(state) {
              var data = state.sources['liPermits'].data.rows;
              var rows = data.map(function(row){
                var itemRow = row;
                return itemRow;
              });
              return rows;
            },
          }"
          :options="{
            id: 'liPermits',
            dataSources: ['liPermits'],
            limit: 5,
            fields: [
              {
                label: 'Date',
                value: function(state, item){
                  return item.permitissuedate
                },
                nullValue: 'no date available',
                transforms: [
                  'date'
                ]
              },
              {
                label: 'ID',
                value: function(state, item){
                  return `<a target='_blank' href='http://li.phila.gov/#details?entity=permits&eid=`+item.permitnumber+`&key=`+item.addresskey+`&address=`+item.address+`'>`+item.permitnumber+` <i class='fa fa-external-link'></i></a>`
                }
              },
              {
                label: 'Description',
                value: function(state, item){
                  return item.permitdescription
                }
              },
              {
                label: 'Status',
                value: function(state, item){
                  return item.status
                }
              },
            ],
            sort: {
              getValue: function(item) {
                return item.permitissuedate;
              },
              order: 'desc'
            },
            externalLink: {
              action: function(count) {
                return 'See ' + count + ' older permits at L&I Property History';
                },
              name: 'L&I Property History',
              href: function(state) {
                var address = state.geocode.data.properties.street_address;
                var addressEncoded = encodeURIComponent(address);
                return 'http://li.phila.gov/#summary?address=' + addressEncoded;
              }
            }
          }"
        />

      </div>



    </div>
  </div>
</template>

<script>
  import axios from 'axios';
  // import 'leaflet/dist/leaflet.css';
  // import 'leaflet-easybutton/src/easy-button.css';

  import MapPanel from './MapPanel.vue';
  import philaVueComps from '@cityofphiladelphia/phila-vue-comps';
  const VerticalTable = philaVueComps.VerticalTable;
  const HorizontalTable = philaVueComps.HorizontalTable;
  const AddressInput = philaVueComps.AddressInput;
  const Callout = philaVueComps.Callout;
  const Badge = philaVueComps.Badge;
  const BadgeCustom = philaVueComps.BadgeCustom;
  const CollectionSummary = philaVueComps.CollectionSummary;
  const ExternalLink = philaVueComps.ExternalLink;

  export default {
    components: {
      MapPanel,
      VerticalTable,
      HorizontalTable,
      AddressInput,
      Callout,
      Badge,
      BadgeCustom,
      CollectionSummary,
      ExternalLink,
    },
  };

</script>

<style scoped>

#app-root {
  height: 100%
}

#components-root {
  display: flex;
  flex-direction:column;
  padding: 20px;
  height: 90%;
  overflow-y: auto;
}

.floating {
  border: 1px solid #ff0000;
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: scroll;
}

.component-label {
  font-size: 20px;
}

.margin-sides-20 {
  display: block;
  margin-left: 20px;
  margin-right: 20px;
}

.margin-20 {
  margin-left: 20px;
  margin-right: 20px;
  margin-bottom: 20px;
}

.margin-bottom-60 {
  margin-bottom: 60px !important;
}

.ib {
  display: inline-block;
}





</style>
