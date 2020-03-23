<template>
  <div
    id="main"
    v-if="this.$store.state.activeModal.featureId"
    :class="['openmaps-about', 'openmaps-modal']"
  >
    <header class="modal">
      <div class="row expanded">
        <div class="columns">
          <div class="print-logo">
            <img
              src="https://standards.phila.gov/img/logo/city-of-philadelphia-blue-text.png"
              alt="City of Philadelphia"
            >
          </div>
          <div class="page-title-container">
            <h1 class="page-title">
              Property Data Explorer
            </h1>
          </div>
        </div>
      </div>
    </header>
    <div
      class="openmaps-modal-close hide-print"
      :tabindex="1"
      @click="closeModal"
      v-on:keydown.enter="closeModal"
    >
      <span class="button-state state-unnamed-state unnamed-state-active pointer">
        <a>Back to results</a>
      </span>
    </div>
    <div class="openmaps-modal-content">
      <div class="address-header cell small-24 medium-24">
        <div
          :class="'address-container columns small-24 medium-12 large-12'"
        >
          <div
            v-if="!activeAddress"
            class="default-address-text"
            :style="defaultAddressTextPlaceholderStyle"
          >
            {{ this.$config.defaultAddressTextPlaceholder.text }}
          </div>
          <h1 class="address-header-line-1">
            <font-awesome-icon icon="map-marker-alt" />
            {{ activeAddress }}
            <div class="columns small-24 medium-6 flex-div div-padding-and-margin hide-print">
              <button-comp-light
                id="plans-button"
                class="print-button"
                :slots="{buttonAction: print}"
              >
                <font-awesome-icon
                  icon="print"
                  class="button-icon"
                />
                Print
              </button-comp-light>
            <!-- <p class="p-margin">Print a payment coupon.</p> -->
            </div>
          </h1>
          <div class="address-header-line-2">
            {{ headerLineTwo }}
          </div>
        </div>
      </div>


      <!-- owner and address horizontal table -->
      <horizontal-table
        class="print-padding"
        :slots="{
          items: opaPublicData
        }"
        :options="ownerAddressTableOptions"
      />

      <!-- sale vertical table -->
      <div
        v-if="!this.$store.state.sources.opa_public.targets[activeOpaId].data"
        class="spinner-div small-12 cell"
      >
        <font-awesome-icon
          icon="spinner"
          class="fa-4x"
          aria-hidden="true"
        />
        <h3>Loading Sale Data</h3>
      </div>

      <vertical-table
        class="print-padding sale-info"
        :slots="saleVerticalTableSlots"
      />

      <!-- main callout -->
      <callout
        class="print-padding"
        :slots="mainCalloutSlots"
      />

      <!-- valuation history horizontal table -->
      <div
        v-if="!this.$store.state.activeSearch.assessmentHistory.data"
        class="spinner-div small-12 cell"
      >
        <font-awesome-icon
          icon="spinner"
          class="fa-4x"
          aria-hidden="true"
        />
        <h3>Loading Valuation History</h3>
      </div>
      <horizontal-table
        v-if="this.$store.state.activeSearch.assessmentHistory.data"
        :slots="{
          title: 'Valuation History',
          items: this.$store.state.activeSearch.assessmentHistory.data
        }"
        :options="valuationHistoryHorizontalTableOptions"
      />

      <!-- taxable and exempt land values callout -->
      <callout
        class="print-padding"
        :slots="propValueCalloutSlots"
      />

      <!-- sales history horizontal table -->
      <div
        v-if="!this.$store.state.activeSearch.salesHistory.data"
        class="spinner-div small-12 cell"
      >
        <font-awesome-icon
          icon="spinner"
          class="fa-4x"
          aria-hidden="true"
        />
        <h3>Loading Sales History</h3>
      </div>
      <horizontal-table
        v-if="this.$store.state.activeSearch.salesHistory.data"
        :slots="{
          title: 'Sales History',
          items: this.$store.state.activeSearch.salesHistory.data
        }"
        :options="salesHistoryHorizontalTableOptions"
      />

      <!-- property details vertical table -->
      <div
        v-if="!this.$store.state.sources.opa_public.targets[activeOpaId].data"
        class="spinner-div small-12 cell"
      >
        <font-awesome-icon
          icon="spinner"
          class="fa-4x"
          aria-hidden="true"
        />
        <h3>Loading Property Details</h3>
      </div>
      <vertical-table
        class="break-avoid"
        :slots="propertyDetailsVerticalTableSlots"
      />
      <callout
        :slots="inquiryCalloutSlots"
      />
      <callout
        class="break-avoid"
        :slots="metadataCalloutSlots"
      />
      <callout
        :slots="openMapsCalloutSlots"
      />
    </div>
  </div>
</template>

<script>
let findConditionCode = function(exterior) {
  const condition = exterior  == 0 ? 'Not Applicable' :
    exterior  == 2 ? 'Newer Construction / Rehabbed' :
      exterior  == 3 ? 'Above Average' :
        exterior  == 4 ? 'Average' :
          exterior  == 5 ? 'Below Average' :
            exterior  == 6 ? 'Vacant' :
              exterior  == 7 ? 'Sealed / Structurally Compromised, Open to the Weather' :
                'Not available';
  return condition;
};

import helpers from '../util/helpers';
import transforms from '../general/transforms';
const titleCase = transforms.titleCase.transform;
const nth = transforms.nth.transform;

export default {
  name: 'PropertyCardModal',
  components: {
    ButtonCompLight: () => import(/* webpackChunkName: "pvc_pvc_ButtonCompLight" */'@phila/vue-comps/src/components/ButtonCompLight.vue'),
    Callout: () => import(/* webpackChunkName: "pvc_pcm_Callout" */'@phila/vue-comps/src/components/Callout.vue'),
    TopicComponentGroup: () => import(/* webpackChunkName: "pvc_pcm_TopicComponentGroup" */'@phila/vue-comps/src/components/TopicComponentGroup.vue'),
    BadgeCustom: () => import(/* webpackChunkName: "pvc_pcm_BadgeCustom" */'@phila/vue-comps/src/components/BadgeCustom.vue'),
    HorizontalTable: () => import(/* webpackChunkName: "pvc_pcm_HorizontalTable" */'@phila/vue-comps/src/components/HorizontalTable.vue'),
    VerticalTable: () => import(/* webpackChunkName: "pvc_pcm_VerticalTable" */'@phila/vue-comps/src/components/VerticalTable.vue'),
  },
  computed: {
    lastSearchMethod() {
      return this.$store.state.lastSearchMethod;
    },
    activeModal() {
      return this.$store.state.activeModal;
    },
    activeFeatureId() {
      console.log('PropertyCardModal activeFeatureId computed is running');
      return this.activeModal.featureId;
    },
    activeModalFeature() {
      return this.$store.state.activeModalFeature;
    },
    activeOpaId() {
      let feature = this.activeModalFeature;
      let opaId;
      if (![ 'geocode', 'reverseGeocode', 'owner search' ].includes(this.lastSearchMethod)) {
        opaId = feature.parcel_number;
      } else {
        opaId = feature.properties.opa_account_num;
      }
      return opaId;
    },
    activeAddress() {
      let feature = this.activeModalFeature;
      let address;
      if ([ 'geocode', 'reverseGeocode', 'owner search' ].includes(this.lastSearchMethod)) {
        address = feature.properties.street_address;
      } else {
        address = feature.address_std;
      }
      return address;
    },
    headerLineTwo() {
      let feature = this.activeModalFeature;
      let zip;
      if ([ 'geocode', 'reverseGeocode', 'owner search' ].includes(this.lastSearchMethod)) {
        zip = feature.properties.zip_code + '-' + feature.properties.zip_4;
      } else {
        zip = feature.zip_code.substring(0,5) + '-' + feature.zip_code.substring(5,10);
      }
      return 'PHILADELPHIA, PA ' + zip;
    },
    mainCalloutSlots() {
      return {
        text: '\
        Property assessment and sale information for this address. Source: Office of Property Assessments (OPA). \
        OPA was formerly a part of the Bureau of Revision of Taxes (BRT) and some City records may still use that name.\
        ',
      };
    },
    inquiryCalloutSlots() {
      let opaPublicData = this.$store.state.sources.opa_public.targets[this.activeOpaId].data;
      let searchId =  opaPublicData.street_code + opaPublicData.house_number + (opaPublicData.unit != null ?  opaPublicData.unit : '') ;
      return {
        text: '\
      Property characteristics described above are included for convenience, but may not reflect the most recent conditions \
      at the property.  Corrections to or questions about this property? \
      <a target="_blank" href="http://opa.phila.gov/opa.apps/Help/CitizenMain.aspx?sch=Ctrl2&s=1&url=search&id='+ searchId + ' ">\
      <b>Submit an Official Inquiry</b>  </b><i class="fa fa-external-link-alt"></i></a></a> to the Office of Property Assessment.\
        ',
      };
    },
    metadataCalloutSlots() {
      return {
        text: '\
        You can download the property assessment dataset in bulk, and get more information about this data at\
        <a target="_blank" \
           href="https://metadata.phila.gov"><b>metadata.phila.gov </b><i class="fa fa-external-link-alt"></i></a>\
        ',
      };
    },
    openMapsCalloutSlots() {
      return {
        text: '\
        Additional information such as trash & recycling day, and districts for highway, traffic and sanitation can be found at\
        <a target="_blank" \
          href="https://openmaps.phila.gov/#/'+this.activeAddress+'"><b>OpenMaps </b><i class="fa fa-external-link-alt"></i></a>\
        ',
      };
    },
    propValueCalloutSlots() {
      return {
        text: '\
        Note: Taxable and exempt land values can represent the contributory value of land in relation to the total market value, or \
        were no structure is present, the value of vacant land. (Consistent with International Association of Assessing Officers (IAAO) standards, \
        the value of an improved parcel is separated into the portion of value attributed to the improvement and the portion of value attributed to the land.)\
        ',
      };
    },
    opaPublicData() {
      let opaData =  [];
      opaData.push(this.$store.state.sources.opa_public.targets[this.activeOpaId].data);
      return opaData ;
    },
    propertyDetailsVerticalTableSlots() {
      // console.log('PropertyCardModal activeFeatureId computed is running')
      let state = this.$store.state;
      let opaPublicData = state.sources.opa_public.targets[this.activeOpaId].data;
      return {
        id: 'propertyDetailsTable',
        dataSources: [ 'opa_public' ],
        title: 'Property Details',
        fields: [
          {
            label: 'Year Built',
            value: function() {
              return opaPublicData.year_built === '0000'? 'Not Available' :
                opaPublicData.year_built === null? 'Not Available' :
                  opaPublicData.year_built + (opaPublicData.year_built_estimate ? ' (estimated)' : '');
            }.bind(this),
          },
          {
            label: 'Building Description',
            value: opaPublicData.building_code_description,
          },
          {
            label: 'Building Condition',
            value: findConditionCode(opaPublicData.exterior_condition),
          },
          {
            label: 'Number of Stories',
            value: opaPublicData.number_stories === null ? "Not Available" :
              opaPublicData.number_stories.toString().length > 0 ?
                opaPublicData.number_stories === 0 ?
                  opaPublicData.total_livable_area > 0 ? 'Not Available':
                    'None' :
                  opaPublicData.number_stories === 1 ? '1 story' :
                    (opaPublicData.number_stories + ' stories') : '',
          },
          {
            label: 'Number of Rooms',
            value: function(state) {
              let room = opaPublicData.number_of_rooms === 1 ? ' room ' : ' rooms ';

              let bedroom =   opaPublicData.number_of_bedrooms === 0 | opaPublicData.number_of_bedrooms === null  ? '' :
                opaPublicData.number_of_bedrooms === 1 ? '(' + opaPublicData.number_of_bedrooms +' bedroom' : '(' + opaPublicData.number_of_bedrooms + ' bedrooms';

              let BrBaCheck = opaPublicData.number_of_bedrooms === 0 | opaPublicData.number_of_bedrooms === null  ?
                opaPublicData.number_of_bathrooms === 0 | opaPublicData.number_of_bathrooms === null  ? ''  :
                  '(' : ', ';

              let bathroom =  opaPublicData.number_of_bathrooms === 0 | opaPublicData.number_of_bathrooms === null  ?
                opaPublicData.number_of_bedrooms === 0 | opaPublicData.number_of_bedrooms === null  ? '' : ')' :
                opaPublicData.number_of_bathrooms === 1 ? BrBaCheck  + opaPublicData.number_of_bathrooms + ' bathroom)' :
                  BrBaCheck  + opaPublicData.number_of_bathrooms + ' bathrooms)';

              let total =  opaPublicData.number_of_rooms === 0 ? opaPublicData.total_livable_area > 0 ? 'Not Available':'None' :
                'Total of ' + opaPublicData.number_of_rooms + room + bedroom + bathroom ;

              total = opaPublicData.number_of_rooms === 0 && opaPublicData.unit != null ? "Not Available" :
                opaPublicData.number_of_rooms === null ? "Not Available" :
                  total;

              return total;
            },
          },
          {
            label: 'Features',
            value: function(state) {
              let basements, fireplaces, garages, buildings, view;
              let features = [];

              switch (opaPublicData.basements) {
              case null: basements= 'No basement';
                break;
              case '0': basements= 'No basement';
                break;
              case 'A': basements = 'Full Finished basement';
                break;
              case 'B': basements = 'Full Semi-finished basement';
                break;
              case 'C': basements = 'Full Unfinished basement';
                break;
              case 'D': basements = 'Full basement';
                break;
              case 'E': basements = 'Finished partial basement';
                break;
              case 'F': basements = 'Semi-finished partial basement';
                break;
              case 'G': basements = 'Unfinished partial basement';
                break;
              case 'H': basements = 'Partial basement';
                break;
              case 'I': basements = 'Finished basement';
                break;
              case 'J': basements = 'Unfinished basement';
                break;
              }

              fireplaces = opaPublicData.fireplaces === 1 ?
                opaPublicData.fireplaces + ' fireplace' :
                opaPublicData.fireplaces === 0 | opaPublicData.fireplaces === null ? 'No fireplace' :
                  opaPublicData.fireplaces + ' fireplaces ';

              switch (opaPublicData.garage_type) {
              case null : garages = 'No garage';
                break;
              case '0' : garages = 'No garage';
                break;
              case 'A': garages = 'Built-in/Basement garage';
                break;
              case 'B': garages = 'Attached garage';
                break;
              case 'C': garages = 'Detached garage';
                break;
              case 'F': garages = 'Converted garage';
                break;
              case 'S': garages = 'Self-park garage';
                break;
              case 'T': garages = 'Attendant parking';
                break;
              }

              switch (opaPublicData.view_type) {
              case '0': view = '';
                break;
              case 'A': view = 'View of cityscape/skyline';
                break;
              case 'B': view = 'View of river/creek';
                break;
              case 'C': view = 'View of park/green area';
                break;
              case 'D': view = 'View of commercial area';
                break;
              case 'E': view = 'View of industrial area';
                break;
              case 'H': view = 'View of historic edifice or landmark';
                break;
              case 'I': view = '';
                break;
              case null : view = '';
                break;
              }


              // buildings = opaPublicData.other_building === 'Y' ? 'Additional building(s) on site' :
              //                                                    'No additional buildings on site'

              garages = opaPublicData.garage_spaces === 1 ?
                garages + ' (' + opaPublicData.garage_spaces + ' space)' :
                opaPublicData.garage_spaces === 0 | opaPublicData.garage_spaces === null ? garages :
                  garages + ' (' + opaPublicData.garage_spaces + ' spaces)';

              // features.push(basements, fireplaces, garages, buildings, view)
              features.push(basements, fireplaces, garages, view);
              return features.join('<br>');

            },
          },
          {
            label: 'Heating and Utilities',
            value: function(state) {
              let heat = [];

              switch (opaPublicData.fuel) {
              case 'A' : heat.push('Natural gas heating');
                break;
              case 'B' : heat.push('Oil fuel heating');
                break;
              case 'C' : heat.push('Electric heating');
                break;
              case 'D' : heat.push('Coal heating');
                break;
              case 'E' : heat.push('Solar heating');
                break;
              case 'F' : heat.push('Woodstove heating');
                break;
              case 'G' : heat.push('Heating source n/a');
                break;
              case 'H' : heat.push('Heating source n/a');
                break;
              case null : heat.push('Heating source n/a');
                break;
              }

              switch (opaPublicData.type_heater) {
              case 'A' : heat.push('Duct (heated air) heaters');
                break;
              case 'B' : heat.push('Radiator/baseboard (heated water) heaters');
                break;
              case 'C' : heat.push('Baseboard (electric) heaters');
                break;
              case 'D' : heat.push('Heater type n/a');
                break;
              case 'E' : heat.push('Heater type n/a');
                break;
              case 'F' : heat.push('Woodstove heating');
                break;
              case 'G' : heat.push('Radiant heaters');
                break;
              case 'H' : heat.push('Heater type n/a');
                break;
              case null : heat.push('Heater type n/a');
                break;
              }

              heat.push( opaPublicData.central_air === 'Y' ? 'Has central air' : 'No central air');

              heat.push( opaPublicData.sewer === 'Y' ? 'City sewer' : 'Sewer type n/a');

              return heat.join('<br>');
            },
          },
          {
            label: 'Lot Size',
            value: opaPublicData.total_area
              .toLocaleString('en-US', {
                minimumFractionDigits: 0,
              }) + ' sq ft',
          },
          {
            label: 'Improvement Area',
            value: opaPublicData.total_livable_area === null ? 'Not Available ' :
              opaPublicData.total_livable_area
                .toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                }) + ' sq ft',
          },
          {
            label: 'Frontage',
            value: opaPublicData.frontage === null ? 'Not Available ' :
              opaPublicData.frontage.toFixed(0) + ' ft',
          },
          {
            label: 'Beginning Point',
            value: opaPublicData.beginning_point,
          },
          {
            label: 'Zoning',
            value: function(state) {
              return '<a target="_blank" \
                        href="https://atlas.phila.gov/#/'+ this.activeAddress + '/zoning ">\
                       <b>' + opaPublicData.zoning + '-' + helpers.ZONING_CODE_MAP[opaPublicData.zoning.trim()] + '</b>\
                       </b> <i class="fa fa-external-link-alt"></i></a>\
                       </a>';
            }.bind(this),
          },
          {
            label: 'OPA Account Number',
            value: this.activeOpaId,
          },
          {
            label: 'OPA Address',
            value: titleCase(this.activeAddress),
          },
          {
            label: 'Homestead Exemption',
            value: function(state) {
              return opaPublicData.homestead_exemption > 0 ? 'Yes' : 'No';
            },
          },
          {
            label: 'Political Divisions',
            value: function(state) {
              return "<a href='http://atlas.phila.gov/#/"+this.activeAddress+"/voting' target='_blank'>\
                      Ward Division: "+nth(opaPublicData.political_ward)+" | Council District: "+ nth(opaPublicData.council_district_2016) +" \
                      <i class='fa fa-external-link-alt'></i></a>";
            }.bind(this),
          },
          {
            label: 'School Catchment',
            value: function() {
              return "<a href='https://webapps1.philasd.org/school_finder/' target='_blank'>\
                      Elementary: "+opaPublicData.elementary_school+" | Middle: "+opaPublicData.middle_school+" | HS: "+opaPublicData.high_school+" |\
                      <i class='fa fa-external-link-alt'></i></a>";
            }.bind(this),
          },
          {
            label: 'Police District',
            value: function() {
              return "<a href='https://webapps1.philasd.org/school_finder/' target='_blank'>\
                      " + nth(opaPublicData.police_district) + " District\
                      <i class='fa fa-external-link-alt'></i></a>";
            }.bind(this),
          },
        ],
      };
    },
    saleVerticalTableSlots() {
      let state = this.$store.state;
      let opaAssessmentData = state.sources.opa_assessment.targets[this.activeOpaId].data;
      return {
        id: 'saleTable',
        dataSources: [ 'opa_public' ],
        fields: [
          {
            label: 'Assessed Value',
            value: function(state) {
              return opaAssessmentData.market_value;
            },
            transforms: [ 'currency' ],
          },
          {
            label: 'Sale Date',
            value: function(state) {
              return opaAssessmentData.sale_date;
            },
            transforms: [ 'date' ],
          },
          {
            label: 'Sale Price',
            value: function(state) {
              return opaAssessmentData.sale_price;
            },
            transforms: [ 'currency' ],
          },
        ],
      };
    },


    ownerAddressTableOptions() {
      let state = this.$store.state;
      let opaPublicData = this.$store.state.sources.opa_public.targets[this.activeOpaId].data;
      return {
        id: 'ownerProperties',
        tableid: 'ddd',
        // dataSources: ['opa'],
        mapOverlay: {},
        mouseOverDisabled: true,
        downloadButton: false,
        customClass: {
          table: 'owner',
          td: 'testClass',
        },
        fields: [
          {
            label: 'Owner',
            value: function(state, item) {
              let owner;
              owner = item.owner_2 != null ?
                item.owner_1.trim() + "<br>" + item.owner_2.trim():
                item.owner_1.trim();
              return owner;
            },
            customClass: 'big_owner',
          },
          {
            label: 'Mailing Address',
            value: function(state, item) {
              let mailingAddress = [];
              let addressFields = [ 'mailing_address_1', 'mailing_address_2', 'mailing_care_of', 'mailing_street',  'mailing_city_state', 'mailing_zip' ];
              addressFields.map( a => item[a] != null ? a === 'mailing_city_state' ?
                mailingAddress.push(titleCase(item[a]) + ' ' ) : mailingAddress.push(titleCase( (item[a])) + ' <br>') :'');
              // console.log('mailingAddress', mailingAddress, item)

              if(mailingAddress.length > 0 ) {
                return mailingAddress.join('');
              }
              // console.log('activeAddress', this.activeAddress, item)
              let zip = item.zip_code.substring(0,5) + '-' + item.zip_code.substring(5,10);
              mailingAddress.push(titleCase( this.activeAddress), 'Philadelphia, PA', zip);
              return mailingAddress.join('<br>');

            }.bind(this),
            customClass: 'small_address',
          },
        ],
      };
    },

    valuationHistoryHorizontalTableOptions() {
      return {
        id: 'ownerProperties',
        tableid: 'ddd',
        // dataSources: ['opa'],
        mapOverlay: {},
        mouseOverDisabled: true,
        downloadButton: false,
        fields: [
          {
            label: 'Year',
            value: function(state, item){
              return item.year;
            },
          },
          {
            label: 'Market Value',
            value: function(state, item){
              return item.market_value;
            },
            transforms: [ 'currency' ],
          },
          {
            label: 'Taxable Land',
            value: function(state, item){
              return item.taxable_land;
            },
            transforms: [ 'currency' ],
          },
          {
            label: 'Taxable Improvement',
            value: function(state, item){
              return item.taxable_building;
            },
            transforms: [ 'currency' ],
          },
          {
            label: 'Exempt Land',
            value: function(state, item){
              return item.exempt_land;
            },
            transforms: [ 'currency' ],
          },
          {
            label: 'Exempt Improvement',
            value: function(state, item){
              return item.exempt_building;
            },
            transforms: [ 'currency' ],
          },
        ],
        sort: {
          // this should return the val to sort on
          getValue: function(item) {
            return item.year;
          },
          // asc or desc
          order: 'desc',
        },
        externalLink: {
          forceShow: true,
          action: function() {
            return 'View the Real Estate Tax Balance';
          },
          name: '',
          href: function(state) {
            let feature = state.activeModalFeature;
            let address;
            if ([ 'geocode', 'reverseGeocode', 'owner search' ].includes(state.lastSearchMethod)) {
              address = feature.properties.street_address;
            } else {
              address = feature.address_std;
            }
            let addressEncoded = encodeURIComponent(address);
            return '//www.phila.gov/revenue/realestatetax/#/' + addressEncoded + '//property';
          },
        },
      };
    },

    salesHistoryHorizontalTableOptions() {
      return {
        id: 'salesHistory',
        tableid: 'ddd',
        // dataSources: ['opa'],
        downloadButton: false,
        mapOverlay: {},
        mouseOverDisabled: true,
        fields: [
          {
            label: 'Date',
            value: function(state, item){
              return item.document_date;
            },
            transforms: [ 'date' ],
          },
          {
            label: 'Adjusted Total',
            value: function(state, item){
              return item.adjusted_total_consideration;
            },
            transforms: [ 'currency' ],
          },
          {
            label: 'Grantees',
            value: function(state, item){
              return item.grantees;
            },
          },
          {
            label: 'Grantors',
            value: function(state, item){
              return item.grantors;
            },
          },
          {
            label: 'Doc Id',
            value: function(state, item){
              return item.document_id;
            },
          },
        ],
        sort: {
          // this should return the val to sort on
          getValue: function(item) {
            return item.document_date;
          },
          // asc or desc
          order: 'desc',
        },
      };
    },
  },
  methods: {
    closeModal(state) {
      this.$store.state.activeModal.featureId = null;
      this.$store.commit('setActiveFeature', null);
      this.$nextTick(() => {
        this.$store.state.map.map.invalidateSize();
      });
    },
    print() {
      window.print();
    },
  },
};
</script>


<style >

@media screen and (min-width: 750px) {
  tr > td.big_owner {
    font-size: 32px;
    font-weight: 100;
    font-family: "Montserrat", sans-serif;
    vertical-align: top;
    padding-top: 0;
  }

  td.small_address {
    font-size: 12px !important;
    font-weight: 100 !important;
    font-family: "Montserrat", sans-serif;
    vertical-align: top !important;
    padding-top: 0 !important;
  }

}

  .owner th, .owner tr {
    background: white !important;
    color: black;
    padding-top: 0;
    padding-bottom: 0;
  }



@media print {

  * {
    background: none !important;
  }

  a {
    color: #0f4d90 !important;
    font-weight: 300 !important;
    font-size: 10px;
  }

  #ownerProperties div.external-link, #salesHistory div.external-link {
    padding-top: 0;
  }

  h4 {
    font-weight: 425;
  }

  #ownerProperties {
    margin: 0;
  }

  .pvc-horizontal-table-body h4, .pvc-horizontal-table-body h4 {
    font-size: 15px;
    margin-bottom: 0rem;
  }

  #ownerProperties th, #salesHistory th {
    font-size: 14px;
    padding-bottom: 4px;
  }
  #ownerProperties td, #salesHistory td {
    font-size: 12px;
    padding-top: 0.371429rem;
    padding-right: 0.714286rem;
    padding-bottom: 0.414286rem;
    padding-left: 0.714286rem;
  }

  #components-root, .bottom-half {
    visibility: hidden;
  }

  .owner td {
    padding-top: 0;
    padding-bottom: 0;
  }

  div.table-container.print-padding, .openmaps-modal-content div.pvc-horizontal-table {
    margin-bottom: 0 !important;
  }


  .address-header[data-v-14c63728] {
    /* background: #DAEDFC !important; */
    -webkit-print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  div.callout {
    /* margin-top: 0; */
    font-size: 10px;
    margin: 10px 0;
    padding-top: 0;
    padding-bottom: 0;
  }

  .external-link svg {
    visibility: hidden;
  }

  .grid-y.medium-grid-frame#application {
    overflow: visible !important;
  }

  .hide-print {
    display: none !important;
    visibility: hidden !important;
  }

  .app-header, .app-footer, #map-panel-container {
    display:none;
  }

  .mb-badge {
    width: 325px !important;
  }

  .mb-badge-header[data-v-7ccdb9d8] {
    font-size: 13pt;
  }

  .openmaps-modal {
    display: inline;
    background: white;
    border-style: none !important;
  }

  /* .padding-top {
    padding-top: 50px;
  } */

  .sale-info tbody th , .sale-info tbody td {
    font-size: 14px;
    padding-top: 0;
    padding-bottom: 0;
  }

  .break-avoid {
    page-break-inside: avoid !important;
  }
  /* .print-padding {
    page-break-inside: avoid !important;
    padding: 20px 0;
  } */

  .pvc-horizontal-table table tr:nth-child(odd) td.big_owner,
  .pvc-horizontal-table table tr:nth-child(odd) td.small_address {
    background: none !important;
  }
  .pvc-horizontal-table table tr:nth-child(odd) td.big_owner,
  .pvc-horizontal-table table tr:nth-child(odd) td.small_address {

    font-family: "Montserrat", sans-serif;
  }

  /* .pvc-horizontal-table table tr:nth-child(odd) td.small_address {
    font-size: 12px !important;
    font-weight: 100 !important;
    font-family: "Montserrat", sans-serif;
    min-width: 145px;
  } */

  .pvc-horizontal-table table tr:nth-child(odd) td {
    background: #eee !important;
    -webkit-print-color-adjust: exact;
  }

  /* .pvc-horizontal-table-body, .table-container {
    page-break-inside: avoid !important;
  } */

  .pvc-download-data-button, .pvc-export-data-button {
    visibility: hidden;
  }

  /* .table-container[data-v-42075018] {
    padding-top: 1rem !important;
    padding-bottom: 1rem !important;
    margin-bottom: 10px !important;
  } */

}

</style>
<style scoped>

@media print {

  h1.address-header-line-1 {
    font-size: 14px;
  }

  header.modal {
    visibility: visible !important;
    margin: 0px 20px 20px 20px;
    background: #2176d2;
    display: block !important;
  }

  table {
    border-spacing: 0px;
    page-break-inside: avoid !important;
  }

  thead, th, tr {
    border: 0.3px solid black;
    border-collapse: unset !important;
  }

  #components-root, #map-panel-container {
    display:none;
  }

  #main.openmaps-modal {
    overflow: visible;
    position: relative;
    top: 0 !important;
    padding: 0 !important;
    height: 100%;
    border-style: none !important;
  }

}

@media screen and (max-width: 750px) {
  #plans-button {
    min-width: 74px;
    display: none;
  }
  .button-state {
    background: white;
  }

  .openmaps-modal {
    width: 100% !important;
    height: 100% !important;
    margin: 0;
    left: 0 !important;
    right: 0 !important;
  }
}

@media screen {

  .address-container {
    height: 100%;
    width: 100%;
    align-items: flex-start;
    padding-left: 20px;
    padding-top: 20px;
    padding-bottom: 20px;
  }

  h1.address-header-line-1 {
    margin-bottom: 0;
    margin-top: 0;
    padding-top: 0px;
    padding-bottom: 0px;
    padding-right: 8px;
    padding-left: 8px;
  }

}

#plans-button{
  padding: 6.5px;
  float: right;
  font-size: 16px;
}

header {
  visibility: hidden ;
  display: none;
}


.address-header {
  background: #daedfe;
  /*this keeps the box shadow over the scrollable part of the panel*/
  position: relative;
  z-index: 1;

  -webkit-box-shadow: 0px 5px 7px -2px rgba(0,0,0,0.18);
  -moz-box-shadow: 0px 5px 7px -2px rgba(0,0,0,0.18);
  box-shadow: 0px 5px 7px -2px rgba(0,0,0,0.18);
  display: inline-block;
}

.address-header-line-2 {
  padding: 0px;
}

.address-header-line-3 {
  padding: 0px;
}

.default-address-text {
  font-size: 30px;
  line-height: 26px;
  font-family: 'Montserrat', 'Tahoma', sans-serif;
  padding-top: 0px !important;
  padding-bottom: 0px !important;
  padding-right: 8px !important;
  padding-left: 8px !important;
}

.div-padding-and-margin {
  padding-top: 15px;
  margin-bottom: 10px;
}

.flex-div {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.icon-div {
  margin: 10px;
}

.openmaps-modal {
  height: 100% ;
  width: 100%;
  position: absolute;
  overflow-y: auto;
  background: white;
  z-index:1000;
  margin: auto;
  max-width: 1200px;
}

.openmaps-modal-content{
  width: 95%;
  height: 85%;
  margin: 0 20px;
}

.openmaps-modal-close{
  background: transparent;
  height: 30px;
  width: 30px;
  z-index: 999;
}

.button-state.state-unnamed-state {
  right: 20px;
  position: absolute;
  padding-top: 5px;
}

.openmaps-modal.openmaps-modal--open{
  z-index:1000;
  opacity: 1;
}

.page-title {
  font-size: 28px !important;
  color: rgb(15, 77, 144) !important;
  align-items: baseline;
  margin-bottom: 0;
}

.print-logo {
  display: inline-block;
  width: 40%;
}

.page-title-container {
  display: inline-block;
  padding-left: 10px;
  border-left: 3px solid rgb(15, 77, 144);
  vertical-align: bottom;
  margin-left: 10px;
}

.street-view-image {
  height: 40px;
  width: 73px;
  color: blue;
}

</style>
