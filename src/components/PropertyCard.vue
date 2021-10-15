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
              Property
            </h1>
          </div>
        </div>
      </div>
    </header>
    <div class="fixed-header">
      <div
        v-if="foundItemsLength > 1"
        class="openmaps-modal-close hide-print"
        :tabindex="1"
        @click="closeModal"
        v-on:keydown.enter="closeModal"
      >
        <span class="button-state state-unnamed-state unnamed-state-active pointer">
          <a>Back to results</a>
        </span>
      </div>
      <div class="address-header cell small-24 medium-24">
        <div
          :class="'address-container columns small-24 medium-12 large-12'"
        >
          <div
            v-if="!activeAddress"
            class="default-address-text"
          >
          <!-- :style="defaultAddressTextPlaceholderStyle" -->
            {{ this.$config.defaultAddressTextPlaceholder.text }}
          </div>
          <h1 class="address-header-line-1">
            <font-awesome-icon icon="map-marker-alt" />
            {{ activeAddress }}
            <div class="columns small-24 medium-6 flex-div div-padding-and-margin hide-print">
            </div>
          </h1>
          <div class="address-header-line-2">
            {{ headerLineTwo }}
          </div>
        </div>
        <div>
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
        </div>
      </div>
    </div>
    <div class="openmaps-modal-content">


      <!-- owner and address horizontal table -->
      <horizontal-table
        class="owner-table"
        :slots="{
          items: opaPublicData
        }"
        :options="ownerAddressTableOptions"
      />

      <!-- sale vertical table -->
      <!-- v-if="!this.$store.state.sources.opa_public.targets[activeOpaId].data" -->
      <div
        v-if="!activeOpaData"
        class="spinner-div small-12 cell"
      >
        <font-awesome-icon
          icon="spinner"
          class="fa-4x"
          aria-hidden="true"
        />
        <h3>Loading Sale Data</h3>
      </div>

      <vertical-table-light
        class="print-padding sale-info"
        :slots="saleVerticalTableSlots"
      />

      <!-- main callout -->

      <p>Office of Property Assessment (OPA) was formerly part of the Board of Revision of Taxes (BRT) and some
        City records may still use that name. Source:
        <a href="https://www.phila.gov/opa/pages/default.aspx" target="_blank">
          Office of Property Assessment (OPA).
        </a>
      </p>

      <!-- Tax Balance Link -->
      <div class="has-background-bell-yellow-light hide-print">
        <font-awesome-icon
          :icon="['fal', 'money-check-alt']"
          class="fa-3x"
        />
        <div>
          <h3>Real Estate Tax Balance</h3>
          Balance details on this property.
        </div>

        <button-comp-light
          :slots="{buttonAction: buttonLinkTaxBalance}"
        >
          View the tax balance
        </button-comp-light>
      </div>

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
        class='valuation-history'
        :slots="{
          title: 'Valuation History',
          subtitle: 'Taxable and exempt land values can represent the \
                     contributory value of land in relation to the total \
                     market value, or were no structure is present, the \
                     value of vacant land. (Consistent with International \
                     Association of Assessing Officers (IAAO) standards, \
                     the value of an improved parcel is separated into the \
                     portion of value attributed to the improvement and the \
                     portion of value attributed to the land.)',
          items: this.$store.state.activeSearch.assessmentHistory.data
        }"
        :options="valuationHistoryHorizontalTableOptions"
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
        class="break-avoid"
        :slots="{
          title: 'Sales History',
          items: this.$store.state.activeSearch.salesHistory.data
        }"
        :options="salesHistoryHorizontalTableOptions"
      />

      <!-- L&I Records Link -->
      <div class="has-background-bell-yellow-light hide-print">
        <font-awesome-icon
          icon="wrench"
          class="fa-3x"
        />
        <div>
          <h3>L&I Records</h3>
          Permits, licenses, violations, and appeals
          <br>related to this property.
        </div>

        <button-comp-light
          :slots="{buttonAction: buttonLinkLI}"
        >
          View L&I Records
        </button-comp-light>
      </div>

      <!-- property details vertical table -->
      <!-- v-if="!this.$store.state.sources.opa_public.targets[activeOpaId].data" -->
      <div
        v-if="!activeOpaData"
        class="spinner-div small-12 cell"
      >
        <font-awesome-icon
          icon="spinner"
          class="fa-4x"
          aria-hidden="true"
        />
        <h3>Loading Property Details</h3>
      </div>
      <vertical-table-light
        class="break-avoid"
        :slots="propertyDetailsVerticalTableSlots"
      />
      <div class="break-avoid">
        <p>You can download the property assessment dataset in bulk, and get more information about this data at
          <a target="_blank"
            href="https://metadata.phila.gov">
              <b>metadata.phila.gov </b><i class="fa fa-external-link-alt"></i>
          </a>
        </p>

      <!-- More Info Link -->
      <div class="has-background-ben-franklin-blue-light hide-print">

        <font-awesome-icon
          :icon="['fal', 'info-circle']"
          class="fa-3x"
          aria-hidden="true"
        />

        <div>
          <h3>Not finding the information you're looking for?</h3>
          For the legacy Property application, try <a href="https://property.phila.gov" target="_blank">property.phila.gov</a>.<br>
          For more information specific to this property, try <a href="https://atlas.phila.gov" target="_blank">atlas.phila.gov</a>
        </div>
      </div>

        <p
          class="show-print-only"
        >
          Note: Taxable and exempt land values can represent the contributory value of land in relation to the total market value, or
          were no structure is present, the value of vacant land. (Consistent with International Association of Assessing Officers (IAAO)
          standards, the value of an improved parcel is separated into the portion of value attributed to the improvement and the portion
          of value attributed to the land.)
        </p>
      </div>
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
  name: 'PropertyCard',
  components: {
    ButtonCompLight: () => import(/* webpackChunkName: "pvc_pvc_ButtonCompLight" */'@phila/vue-comps/src/components/ButtonCompLight.vue'),
    Callout: () => import(/* webpackChunkName: "pvc_pcm_Callout" */'@phila/vue-comps/src/components/Callout.vue'),
    TopicComponentGroup: () => import(/* webpackChunkName: "pvc_pcm_TopicComponentGroup" */'@phila/vue-comps/src/components/TopicComponentGroup.vue'),
    BadgeCustom: () => import(/* webpackChunkName: "pvc_pcm_BadgeCustom" */'@phila/vue-comps/src/components/BadgeCustom.vue'),
    HorizontalTable: () => import(/* webpackChunkName: "pvc_pcm_HorizontalTable" */'@phila/vue-comps/src/components/HorizontalTable.vue'),
    VerticalTable: () => import(/* webpackChunkName: "pvc_pcm_VerticalTable" */'@phila/vue-comps/src/components/VerticalTable.vue'),
    VerticalTableLight: () => import(/* webpackChunkName: "pvc_pcm_VerticalTableLight" */'@phila/vue-comps/src/components/VerticalTableLight.vue'),
  },
  props: {
    foundItemsLength: {
      type: Number,
      default: 1,
    },
  },
  computed: {
    activeOpaData() {
      let value = [];
      if (this.$store.state.sources.opa_public.targets[this.activeOpaId] && this.$store.state.sources.opa_public.targets[this.activeOpaId].data) {
        value = this.$store.state.sources.opa_public.targets[this.activeOpaId].data;
      }
      return value;
    },
    lastSearchMethod() {
      return this.$store.state.lastSearchMethod;
    },
    activeModal() {
      return this.$store.state.activeModal;
    },
    activeFeatureId() {
      return this.activeModal.featureId;
    },
    activeModalFeature() {
      return this.$store.state.activeModalFeature;
    },
    activeOpaId() {
      let feature = this.activeModalFeature;
      let opaId;
      if (feature && ![ 'geocode', 'reverseGeocode', 'owner search', 'block search' ].includes(this.lastSearchMethod)) {
        opaId = feature.parcel_number;
      } else if (feature) {
        opaId = feature.properties.opa_account_num;
      }
      return opaId;
    },
    activeAddress() {
      let feature = this.activeModalFeature;
      let address;
      // console.log("active modal feature: ", this.activeModalFeature)
      if (feature && [ 'geocode', 'reverseGeocode', 'owner search', 'block search' ].includes(this.lastSearchMethod)) {
        address = feature.properties.street_address;
      } else if (feature) {
        address = feature.address_std;
      }
      return address;
    },
    headerLineTwo() {
      let feature = this.activeModalFeature;
      let zip;
      if (feature && [ 'geocode', 'reverseGeocode', 'owner search', 'block search' ].includes(this.lastSearchMethod)) {
        zip = feature.properties.zip_code + '-' + feature.properties.zip_4;
      } else if (feature) {
        zip = feature.zip_code.substring(0,5) + '-' + feature.zip_code.substring(5,10);
      }
      return 'PHILADELPHIA, PA ' + zip;
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
      let opaData = [];
      if (this.$store.state.sources.opa_public.targets && this.$store.state.sources.opa_public.targets[this.activeOpaId]) {
        opaData.push(this.$store.state.sources.opa_public.targets[this.activeOpaId].data);
      }
      return opaData;
    },
    propertyDetailsVerticalTableSlots() {
      // console.log('PropertyCard activeFeatureId computed is running')
      let state = this.$store.state;
      let opaPublicData = this.activeOpaData;
      // let opaPublicData = state.sources.opa_public.targets[this.activeOpaId].data;
      let searchId =  opaPublicData.street_code + opaPublicData.house_number + (opaPublicData.unit != null ?  opaPublicData.unit : '') ;
      return {
        id: 'propertyDetailsTable',
        dataSources: [ 'opa_public' ],
        title: 'Property Details',
        subtitle:  '\
          Property characteristics described below are included for convenience, but may not reflect the most recent conditions \
          at the property.  Corrections to or questions about this property? <br>\
          <a target="_blank" href="https://opainquiry.phila.gov/opa.apps/help/PropInq.aspx?acct_num='+ this.activeOpaId + ' ">\
          <b>Submit an Official Inquiry</b>  </b><i class="fa fa-external-link-alt"></i></a></a>\
          <div class="intro-blue warning">\
          <div class="icon">\
            <i class="fa fa-exclamation-triangle fa-5x"></i>\
          </div>\
          <div>\
            <p>\
              Please note that the OPA is currently upgrading its computer systems.  This implementation \
              may cause delays in updating internal records and displaying current information in this section.  \
              We apologize for any delays you may experience. \
            </p> \
            <p>\
              You may contact the OPA at <a href="tel:+12156864334">215-686-4334</a> for information on a property, \
              or submit an official inquiry above.\
            </p>\
          </div>\
        </div>\
        ',
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
              opaPublicData.number_stories && opaPublicData.number_stories.toString().length > 0 ?
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
            value: opaPublicData.total_area ?
              opaPublicData.total_area.toLocaleString('en-US', {
                minimumFractionDigits: 0,
              }) + ' sq ft' :
              null,
          },
          {
            label: 'Improvement Area',
            value: opaPublicData.total_livable_area === null ? 'Not Available ' :
              opaPublicData.total_livable_area ?
                opaPublicData.total_livable_area.toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                }) + ' sq ft':
                null,
          },
          {
            label: 'Frontage',
            value: opaPublicData.frontage === null ? 'Not Available ' :
              opaPublicData.frontage ?
              opaPublicData.frontage.toFixed(0) + ' ft' :
              null,
          },
          {
            label: 'Beginning Point',
            value: opaPublicData.beginning_point,
          },
          {
            label: 'Zoning',
            value: function(state) {
              let zoningCodeMapTrimmed = opaPublicData.zoning ? helpers.ZONING_CODE_MAP[opaPublicData.zoning.trim()] : 'Not Available'
              if (opaPublicData.zoning) {
                return '<a target="_blank" \
                          href="https://atlas.phila.gov/'+ this.activeAddress + '/zoning ">\
                         <b>' + opaPublicData.zoning + '-' + zoningCodeMapTrimmed + '</b>\
                         </b> <i class="fa fa-external-link-alt"></i></a>\
                         </a>';
              } else {
                    return '<a target="_blank" \
                      href="https://atlas.phila.gov/'+ this.activeAddress + '/zoning">\
                      <b> See Atlas </b>\
                      </b> <i class="fa fa-external-link-alt"></i></a>\
                      </a>';
              }
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
              return "<a href='http://atlas.phila.gov/"+this.activeAddress+"/voting' target='_blank'>\
                      Ward: "+nth(opaPublicData.political_ward)+" | Council District: "+ nth(opaPublicData.council_district_2016) +" \
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
              return "<a href='https://www.phillypolice.com/districts/" + nth(opaPublicData.police_district) + "/index.html' target='_blank'>\
                      " + nth(opaPublicData.police_district) + " District\
                      <i class='fa fa-external-link-alt'></i></a>";
            }.bind(this),
          },
        ],
      };
    },
    saleVerticalTableSlots() {
      let state = this.$store.state;
      let opaAssessmentData = [];
      if (state.sources.opa_assessment.targets[this.activeOpaId]) {
        opaAssessmentData = state.sources.opa_assessment.targets[this.activeOpaId].data;
      }
      return {
        id: 'saleTable',
        dataSources: [ 'opa_public' ],
        title: 'Property assessment and sale information',
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
      let opaPublicData = [];
      if (this.$store.state.sources.opa_public.targets && this.$store.state.sources.opa_public.targets[this.activeOpaId]) {
        opaPublicData = this.$store.state.sources.opa_public.targets[this.activeOpaId].data;
      }
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
            customClass: 'large-owner',
          },
          {
            label: 'OPA Account Number',
            value: function(state, item) {
              let mailingAddress = [];
              mailingAddress.push('<span class="large-owner">' + this.activeOpaId+'</span><br>');
              mailingAddress.push('<br class="mobile-break">');
              mailingAddress.push('<span class="small-address">Mailing Address</span> <br>');
              if(item.mailing_city_state !== null) {
                let addressFields = [ 'mailing_care_of', 'mailing_address_1', 'mailing_street', 'mailing_address_2', 'mailing_city_state', 'mailing_zip' ];
                addressFields.map( a => item[a] != null ? a === 'mailing_city_state' ?
                mailingAddress.push(titleCase(item[a]) + ' ' ) : mailingAddress.push(titleCase( (item[a])) + ' <br>') :'')
                return mailingAddress.join(' ');
              } else {
                // console.log('activeAddress', this.activeAddress, item)
                let zip = item.zip_code.substring(0,5) + '-' + item.zip_code.substring(5,10);
                mailingAddress.push(titleCase( this.activeAddress), '<br>Philadelphia, PA', zip);
                return mailingAddress.join(' ');
              }

            }.bind(this),
            customClass: 'small-address',
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
    buttonLinkLI(){
      window.open('https://li.phila.gov/property-history/search?address=' + this.activeOpaId, '_blank');
      return false;
    },
    buttonLinkTaxBalance(){
      window.open('https://www.phila.gov/revenue/realestatetax/#/' + this.activeOpaId, '_blank');
      return false;
    },
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


<style lang="scss">

@media screen {
  p.show-print-only {
    display: none;
  }

  .address-header .address-container {
    height: 100%;
    width: 80%;
    align-items: flex-start;
    padding-left: 20px;
    padding-top: 5px;
    padding-bottom: 5px;
  }

  h1.address-header-line-1 {
    margin-bottom: 0;
    margin-top: 0;
    padding-top: 0px;
    padding-bottom: 0px;
    padding-right: 8px;
    padding-left: 8px;
  }

  #plans-button {
    position: absolute;
    top: 25%;
  }

  span.small-address {
    font-weight: bold;
    line-height: 2;
  }

}

@media screen and (max-width: 1030px) {
  #plans-button {
    margin: 5px 0 5px 0;
    width: 250px;
    position: relative;
    right: 25%;
  }
  .address-header .address-container {
    width: 100%;
  }
}
@media screen and (min-width: 1030px) {
   div.openmaps-modal-content{
    height: 85%;
    padding-top: 125px;
  }
}
@media screen and (min-width: 750px) {

 .openmaps-modal-content{
    height: 85%;
    padding-top: 150px;
  }

  .fixed-header {
    position: fixed;
    white-space: nowrap;
    width: calc(50% - 15px);
  }

  tr > td.big_owner {
    font-size: 32px;
    font-weight: 100;
    font-family: "Montserrat", sans-serif;
    vertical-align: top;
    padding-top: 0;
    padding-bottom: 0;
  }

  td.small-address {
    font-size: 12px !important;
    font-weight: 100;
    font-family: "Montserrat", sans-serif;
    vertical-align: top !important;
    padding-top: 0 !important;
    padding-bottom: 0;
  }
  .mobile-break {
    display: none;
  }

  td.large-owner>div>div>div, span.large-owner {
    font-size: 24px;
  }


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

  #ownerProperties>tbody>tr>td.large-owner {
    background-color: white !important;
  }

  span.small-address {
    font-weight: bold;
  }

  td.large-owner>div>div>div, span.large-owner {
    font-size: 24px;
  }

  .print-button {
    display: none;
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

  /* .grid-y.medium-grid-frame #application {
    overflow: visible !important;
  } */

  .hide-print {
    display: none !important;
    visibility: hidden !important;
  }

  .app-header, .app-footer {
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
  .pvc-horizontal-table table tr:nth-child(odd) td.small-address {
    background: none !important;
  }
  .pvc-horizontal-table table tr:nth-child(odd) td.big_owner,
  .pvc-horizontal-table table tr:nth-child(odd) td.small-address {

    font-family: "Montserrat", sans-serif;
  }

  /* .pvc-horizontal-table table tr:nth-child(odd) td.small-address {
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

.address-opa-right {
  float: right;
  margin-left: 10px;
}

.has-background-bell-yellow-light {
  background-color: #fff7d0;
}

.has-background-ben-franklin-blue-light {
  background-color: #daedfe;
}

.has-background-bell-yellow-light, .has-background-ben-franklin-blue-light  {
  z-index: 300;
  display: flex;
  justify-content: space-between;
  margin: 35px  0px;
  padding: 10px;
  flex-wrap: wrap;
  svg {
    margin: auto 5px;
    top: 50%;
    flex-grow: 2;
  }
  div {
    padding-left: 15px;
    min-width: 260px;
    flex-grow: 4;
  }
  div, .button-light {
    margin: 5px 5px;
    h3 {
      margin-bottom: 0;
    }
  }
  .button-light {
    max-height: 32px;
    min-width: 190px;
    padding: 10px 7px 24px 7px;
    margin: auto;
    right: 5px;
    align-self: flex-end;
    flex-grow: 2;
  }
}

#ownerProperties {
  margin-bottom: 20px;
  td {
    line-height: 1.25;
    color: #444;
  }
  .owner-left {
    float: left;
  }
}

.valuation-history h5 {
  font-size: 14px;
  margin: 1%;
  color: #444 !important;
}

.owner th, .owner tr {
  background: white !important;
  color: #444;
  padding-top: 0;
  padding-bottom: 0;
}

.fixed-header {
  background-color: white;
  white-space: nowrap;
}

.pvc-horizontal-table-body h4, h4.table-title {
  width: 100%;
  background-color: #f0f0f0;
  padding: 5px;
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
    /* overflow: visible; */
    /* position: absolute; */
    top: 0 !important;
    /* padding: 0 !important; */
    height: 100%;
    border-style: none !important;
  }

  /* .openmaps-modal-content {
    overflow-y: visible;
  } */

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
    /* width: 100% !important; */
    height: 100% !important;
    margin: 0;
    left: 0 !important;
    right: 0 !important;
  }
  .openmaps-modal-content {
    height: auto !important;
  }


  .large-owner, td.large-owner, .owner th {
    font-size: 24px;
  }

  br.mobile-break {
    display: visible;
  }


}

@media screen {

  /* .openmaps-modal-content {
    overflow-y: scroll;
  } */

  .owner th, .owner .small-address {
    font-size: 10px;
    padding-top: 10px;
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
  padding: 0 0 0 40px;
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
  /* width: 100%; */
  /* position: absolute; */
  background: white;
  z-index:1000;
  margin: auto;
  max-width: 1200px;
}

.openmaps-modal-content{
  padding-left: 20pt;
  padding-right: 20pt;
}

.openmaps-modal-close{
  height: 30px;
  width: 30px;
  z-index: 999;
}

.button-state.state-unnamed-state {
  right: 20px;
  position: absolute;
  padding-top: 5px;
  font-weight: bold;
  text-decoration: underline;
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
