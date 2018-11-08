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
              <h1 class="page-title">Property Reboot</h1>
            </a>
          </div>
        </div>
      </div>
    </header>

    <div id="components-root">


      <div class="flexing">

        <map-panel/>


      </div>

      <div class="flexing bottom">

          <horizontal-table
            v-if="this.$store.state.geocode.status && this.$store.state.geocode.status !== 'error'"
            class="margin-20"
            :slots="{
              items: function(state) {
                var data = state.geocode.related;
                /* data != null ? data.push(state.geocode) : data = state.geocode; */
                if (data) {
                  data.push(state.geocode.data);
                } else {
                  data = state.geocode.data;
                }
                return data;
              },
            }"
            :options="this.ownerOptions"
          />
          <horizontal-table
            v-if="this.$store.state.ownerSearch.status"
            class="margin-20"
            :slots="{
              items: function(state) {
                var data = state.ownerSearch.data;
                return data;
              },
            }"
            :options="this.ownerOptions"
          />

      </div>

    </div>
  </div>
</template>

<script>
  import axios from 'axios';
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
    computed: {
      ownerOptions() {
        const options = {
          id: 'ownerProperties',
          /* dataSources: ['liPermits'], */
          /* limit: 5, */
          fields: [
            {
              label: 'Owner',
              value: function(state, item){
                return item.properties.opa_owners.toString();
              },
              /* nullValue: 'no date available', */
            },
            {
              label: 'Street Address',
              value: function(state, item, controller) {
                const test = controller.test
                /* controller.test(); */
                return `<a target='_blank' href='https://atlas.phila.gov/#/`+item.properties.street_address+`/property'>`+item.properties.street_address+` <i class='fa fa-external-link'></i></a>`
                // return '<a href=# onclick="'+test+'()">'+item.properties.street_address+' <i class="fa fa-external-link"></i></a>'
              }
            },
            {
              label: 'Description',
              value: function(state, item){
                /* return item.permitdescription */
              }
            },
            {
              label: 'Status',
              value: function(state, item){
                /* return item.status */
              }
            },
          ],
          /* sort: {
            getValue: function(item) {
              return item.permitissuedate;
            },
            order: 'desc'
          }, */
          /* externalLink: {
            action: function(count) {
              return 'See ' + count + ' older permits at L&I Property History';
              },
            name: 'L&I Property History',
            href: function(state) {
              var address = state.geocode.data.properties.street_address;
              var addressEncoded = encodeURIComponent(address);
              return 'http://li.phila.gov/#summary?address=' + addressEncoded;
            }
          } */
        }
        return options;
      }
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
  height: 90%;
  overflow-y: auto;
  position: relative;
}

.flexing {
  border: 1px solid #ff0000;
  display: flex;
  flex: 1;
  flex-direction: column;
  position: relative;
}

.bottom {
  overflow-y: auto;
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
