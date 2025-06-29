<template>

  <!-- Property Tax Calculator -->
  <div class="tax-calc-section has-background-ben-franklin-blue-light hide-print">
    <div>
      <h3>
        <b>Real Estate Tax Estimator</b>
      </h3>
      <div class="tax-year-container">
        <label for="tax_year">Assessment Year</label>
        <select
          name="tax_year"
          id="tax_year"
          ref='tax_year'
          v-model="selectedTaxYear"
        >
          <option v-if="!this.nextYear" :value="this.lastYear">{{ this.lastYear }}</option>
          <option :value="currentYear">{{ currentYear }}</option>
          <option v-if="this.nextYear" :value="this.nextYear">{{ this.nextYear }}</option>
        </select>
      </div>
      <p>
        <!-- If you’ve purchased your home within the last year, please contact the Hotline for information and assistance at (215) 686-9200. -->
        Homeowners may be eligible for programs to help reduce your taxes, like the
        <a target="_blank" href="https://www.phila.gov/services/payments-assistance-taxes/payment-plans-and-assistance-programs/other-payment-plans-and-programs/get-the-homestead-exemption/">Homestead Exemption</a>,
        <a target="_blank" href="https://www.phila.gov/services/payments-assistance-taxes/income-based-assistance-programs/longtime-owner-occupants-program/">
        Long-time Owner Occupant Program (LOOP)</a>,
        <a target="_blank" href="https://www.phila.gov/services/payments-assistance-taxes/senior-citizen-discounts/low-income-senior-citizen-real-estate-tax-freeze/">
        Senior Citizen Tax Freeze</a>, or
        <a target="_blank" href="https://www.phila.gov/services/payments-assistance-taxes/taxes/property-and-real-estate-taxes/get-real-estate-tax-relief/tax-freeze/apply-for-the-low-income-real-estate-tax-freeze/">
        Low-Income Tax Freeze</a>.
        For information and assistance, contact (215) 686-9200 for questions about Homestead, LOOP, or the Office of Property Assessment (OPA). For other Real Estate Tax questions, contact the Dept of Revenue at (215) 686-6442.
      </p>
      <!-- <p>
        In 2024, the City expanded the assistance program and created a <a target="_blank" href="https://www.phila.gov/services/payments-assistance-taxes/taxes/property-and-real-estate-taxes/get-real-estate-tax-relief/tax-freeze/apply-for-the-low-income-real-estate-tax-freeze/">
        Low-Income Tax Freeze</a>. Apply by January 31 and pay the same bill amount every year. Find more details at <a target="_blank" href="phila.gov/tax-freeze">phila.gov/tax-freeze</a>.
      </p> -->
      <p>
        The calculator below compares what your Real Estate Tax bill would be if you enroll in one of these programs for the
        {{ selectedTaxYear }} Assessment Year.  These estimates are for information only and may not reflect your bill if you are already
        enrolled in the program.  If you are currently enrolled, you never have to reapply unless your deed changes.  View your current
        tax bill at the <a target="_blank" href="https://tax-services.phila.gov/_/">Philadelphia Tax Center</a>.
        You must submit the necessary applications to receive tax assistance programs or exemptions.
      </p>
      <div
        class="tax-calc-container"
        id="tax-calculator"
        v-if="activeOpaData"
      >
        <div class="tax-calc-element">
          <label for="homestead_exemption">Select exemption</label>
          <select
            name="homestead_exemption"
            id="homestead_exemption"
            ref='homestead_exemption'
            v-model="selectedExemption"
          >
            <!-- <option value="current">Current bill</option> -->
            <option value="none">No exemption</option>
            <option value="homestead">Homestead Exemption</option>
            <option value="loop">Long-time Owner Occupant Program</option>
            <option value="lowIncome">Low-Income Tax Freeze</option>
            <option value="senior">Senior Citizen Tax Freeze</option>
          </select>
        </div>

        <div
          v-if="!seniorSelected"
          class="tax-calc-element"
        >
          <label for="estimated_tax">Estimated {{ selectedTaxYear }} Tax</label>

          <span
            v-if="!(lowIncomeSelected && selectedTaxYear == '2024')"
            id="estimate_total"
          > {{ taxableValue }} </span>

          <div v-else class="exception-note">The Low-Income Tax Freeze is not available for the {{ selectedTaxYear }} assessment year.</div>
        </div>

        <div
          v-if="loopSelected && loopEitherEligible"
          class="tax-calc-element"
        >
          <label for="estimated_tax">Assessment Cap</label>
          <span id="estimate_total"> {{ loopAssessmentCap }} </span>
        </div>

        <div
          v-if="seniorSelected"
          class="tax-calc-element"
        >
          <label for="homestead_exemption">Eligible year</label>
          <select
            name="homestead_exemption"
            id="homestead_exemption"
            ref='homestead_exemption'
            v-model="selectedSeniorYear"
          >
            <option
              v-for="year in seniorYears"
              :value="year"
            >
              {{ year }}
            </option>
          </select>
        </div>

        <div
          v-if="seniorSelected"
          class="tax-calc-element"
        >
          <label for="estimated_tax">Estimated {{ selectedTaxYear }} Tax</label>
          <span id="estimate_total"> {{ taxableValue }} </span>
        </div>

      </div>

      <div
        v-if="currentSelected || noneSelected || homesteadSelected"
        class="tax-calc-div"
      >
        <div
          v-if="hasHomestead"
          class="tax-calc-div"
        >
          <h4><b>This property has the Homestead Exemption</b></h4>
          <p>You never have to reapply for the Homestead Exemption unless your deed changes, such as when refinancing a mortgage or adding a co-owner.</p>
        </div>
        <div
          v-else
          class="tax-calc-div"
        >
          <h4><b>This property currently does not have a Homestead Exemption</b></h4>
          <p>If you qualify for the Homestead Exemption on your home,
            <a href="https://www.phila.gov/services/property-lots-housing/property-taxes/get-real-estate-tax-relief/get-the-homestead-exemption/" target="_blank">
            apply before December 1
            </a> of this year.
          </p>
        </div>
      </div>

      <div
        v-if="homesteadSelected"
        class="tax-calc-div"
      >
        <p>
          The <b>Homestead Exemption</b> reduces your property’s assessed value by up to $100,000, saving you up to $1,399 on your Real Estate Tax bill each year. To learn more
          about the program and how to apply, <a target="_blank" href="https://www.phila.gov/services/payments-assistance-taxes/payment-plans-and-assistance-programs/other-payment-plans-and-programs/get-the-homestead-exemption/">
          check the guidelines</a>. The deadline
          to apply for the Homestead Exemption for {{ selectedTaxYear }} is <b>December 1,
          {{ selectedTaxYear - 1 }}</b>. If you can, apply by <b>October 1</b> for early enrollment.
        </p>
      </div>

      <div
        v-if="loopSelected && !loopEitherEligible"
        class="tax-calc-div"
      >
        <h4><b>This property is not eligible to apply for LOOP for {{ selectedTaxYear }}</b></h4>
        <h5>Properties are only eligible for LOOP if the assessed value increased more than a certain amount compared to previous years</h5>
      </div>
      <div
        v-if="loopSelected && loopEitherEligible"
        class="tax-calc-div"
      >
        <h4><b>This property may be eligible to apply for LOOP for {{ selectedTaxYear }}</b></h4>
        <h5>Households must meet other eligibility requirements including income limits and have been living on the property for least ten years</h5>
      </div>

      <div
        v-if="loopSelected"
        class="tax-calc-div"
      >
        <p>
          The <b>Long-time Owner Occupant Program (LOOP)</b> caps your property's assessed value each year
          so that the amount of Real Estate Tax you owe will not increase as your property assessment changes
          for as long as you remain in the program. If the tax rate changes, or you are no longer eligible
          for the program, your tax payment may increase. To learn more about the program and how to apply,
          <a target="_blank" href="https://www.phila.gov/services/payments-assistance-taxes/payment-plans-and-assistance-programs/income-based-programs-for-residents/apply-for-the-longtime-owner-occupants-program-loop/">
          check the guidelines</a>. The deadline to apply for LOOP for {{ selectedTaxYear }} is
          <b>September 30, {{ selectedTaxYear }}</b>.
        </p>
      </div>

      <div
        v-if="lowIncomeSelected"
        class="tax-calc-div"
      >
        <h5>Households must meet other eligibility requirements including income limits and residency to qualify</h5>
        <p>
          The <b>Low-Income Tax Freeze</b> locks in your Real Estate Tax bill so you pay the same amount every year,
          even if your property assessment or the tax rate changes. If your tax liability decreases due to a
          lower property assessment or a tax rate decrease, we will update your benefit, lower your bill, and
          freeze it at the new amount. To learn more about the program and how to apply,
          <a target="_blank" href="https://www.phila.gov/services/payments-assistance-taxes/taxes/property-and-real-estate-taxes/get-real-estate-tax-relief/tax-freeze/apply-for-the-low-income-real-estate-tax-freeze/">
          check the guidelines</a>. The deadline to apply for the Low Income Tax Freeze
          for {{ selectedTaxYear }} is <b>January 31, {{ selectedTaxYear }}</b>.
        </p>
      </div>

      <div
        v-if="seniorSelected"
        class="tax-calc-div"
      >
        <h5>Households must meet other eligibility requirements including age, income limits, and residency to qualify</h5>
        <p>
          The <b>Senior Citizen Tax Freeze</b> locks in your Real Estate Tax bill so you pay the same amount
          every year, even if your property assessment or the tax rate changes. If
          you became eligible by age, income, and residency qualifications between 2018 and the current year, your
          bill will be frozen at the earliest year you meet all criteria. Use the drop down above to
          estimate your tax payment depending on which year you are eligible. To learn more about the
          program and how to apply, <a target="_blank" href="https://www.phila.gov/services/payments-assistance-taxes/payment-plans-and-assistance-programs/senior-citizen-programs/apply-for-the-low-income-senior-citizen-real-estate-tax-freeze/">
          check the guidelines</a>. The deadline to apply for the Senior
          Citizen Tax Freeze for {{ selectedTaxYear }} is <b>September 30, {{ selectedTaxYear }}</b>.
        </p>
      </div>
    </div>
  </div>
  <!-- End of 2023 Property Tax Calculator -->

</template>

<script>

// Dollar conversion for 2023 Property Tax Estimator
const dollarUSLocale = Intl.NumberFormat('en-US', {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
});

let thisYear = new Date().getFullYear();
// console.log('currentYear:', currentYear);
// let nextYear = currentYear + 1;

export default {
  name: 'TaxCalculator',
  data() {
    return {
      // currentYear: currentYear,
      // nextYear: nextYear,
      selectedTaxYear: thisYear,
      selectedExemption: 'none',
      currentTaxRate: 0.013998,
      selectedSeniorYear: thisYear,
      homesteadDeduction: {
        2026: 100000,
        2025: 100000,
        2024: 80000,
        2023: 80000,
        2022: 45000,
        2021: 45000,
        2020: 45000,
        2019: 40000,
        2018: 30000,
      },
    };
  },
  mounted() {
    console.log('TaxCalculator.vue mounted, this.nextYear:', this.nextYear, 'this.currentYear:', this.currentYear);
    if (this.nextYear) {
      this.selectedTaxYear = this.nextYear;
      this.selectedSeniorYear = this.nextYear;
    } else {
      this.selectedTaxYear = this.currentYear;
      this.selectedSeniorYear = this.currentYear;
    }
  },
  computed: {
    currentYear() {
      return new Date().getFullYear();
    },
    assessmentHistory() {
      return this.$store.state.activeSearch.assessmentHistory.data;
    },
    lastAssessmentYear() {
      if (this.$store.state.activeSearch.assessmentHistory.data) {
        return this.$store.state.activeSearch.assessmentHistory.data[0].year;
      }
    },
    nextYear() {
      let value = null;
      if (this.lastAssessmentYear && this.currentYear < this.lastAssessmentYear) {
        value = this.currentYear + 1;
      }
      return value;
    },
    lastYear() {
      return this.currentYear - 1;
    },
    hasHomestead() {
      return this.activeOpaData.homestead_exemption > 0;
    },
    currentSelected() {
      return this.selectedExemption == 'current';
    },
    noneSelected() {
      return this.selectedExemption == 'none';
    },
    homesteadSelected() {
      return this.selectedExemption == 'homestead';
    },
    loopSelected() {
      return this.selectedExemption == 'loop';
    },
    seniorSelected() {
      return this.selectedExemption == 'senior';
    },
    seniorYears() {
      let years = [];
      for (let i=this.selectedTaxYear; i>=2018; i--) {
        years.push(i);
      }
      return years;
    },
    lowIncomeSelected() {
      return this.selectedExemption == 'lowIncome';
    },
    assessmentValuesByYear() {
      let values = {};
      for (let item of this.assessmentHistory) {
        values[item.year] = item.market_value;
      }
      console.log('assessmentValuesByYear, values:', values);
      return values;
    },
    allValuesPreviousFiveYears() {
      let selectedYear = parseInt(this.selectedTaxYear);
      let values = [];
      for (let i=selectedYear-1; i>=selectedYear-5; i--) {
        values.push(this.assessmentValuesByYear[i]);
      }
      return values;
    },
    lowestValuePreviousFiveYears() {
      return Math.min(...this.allValuesPreviousFiveYears);
    },
    selectedYearValue() {
      return this.assessmentHistory.filter(item => item.year == parseInt(this.selectedTaxYear))[0].market_value;
    },
    previousYearValue() {
      return this.assessmentHistory.filter(item => item.year == parseInt(this.selectedTaxYear) - 1)[0].market_value;
    },
    loopOneFiveValue() {      
      return this.selectedYearValue/this.previousYearValue;
    },
    loopOneFiveEligible() {
      return this.loopOneFiveValue >= 1.5;
    },
    loopOneSevenFiveValue() {
      const currentYearData = this.assessmentHistory.filter(item => item.year == parseInt(this.selectedTaxYear))[0];
      return currentYearData.market_value/this.lowestValuePreviousFiveYears;
    },
    loopOneSevenFiveEligible() {
      return this.loopOneSevenFiveValue >= 1.75;
    },
    loopEitherEligible() {
      return this.loopOneFiveEligible || this.loopOneSevenFiveEligible; 
    },
    loopBothEligible() {
      return this.loopOneFiveEligible && this.loopOneSevenFiveEligible;
    },
    loopBase() {
      if (this.loopBothEligible && this.loopOneFiveValue <= this.loopOneSevenFiveValue) {
        return this.previousYearValue;
      } else if (this.loopBothEligible && this.loopOneFiveValue < this.loopOneSevenFiveValue) {
        return this.lowestValuePreviousFiveYears;
      } else if (!this.loopBothEligible && this.loopOneSevenFiveEligible) {
        return this.lowestValuePreviousFiveYears;
      } else if (!this.loopBothEligible && this.loopOneFiveEligible) {
        return this.previousYearValue;
      } else {
        return this.selectedYearValue;
      }
    },
    loopEligibilityUsed() {
      if (this.loopBothEligible && this.loopOneFiveValue <= this.loopOneSevenFiveValue) {
        return 'oneFive';
      } else if (this.loopBothEligible && this.loopOneFiveValue > this.loopOneSevenFiveValue) {
        return 'oneSevenFive';
      } else if (!this.loopBothEligible && this.loopOneSevenFiveEligible) {
        return 'oneSevenFive';
      } else if (!this.loopBothEligible && this.loopOneFiveEligible) {
        return 'oneFive';
      } else {
        return 'none';
      }
    },
    rawPayment() {
      return this.selectedYearValue * this.currentTaxRate;
    },
    loopCurrentYearPayment() {
      if (this.loopEligibilityUsed == 'oneFive') {
        return this.loopBase * 1.5 * this.currentTaxRate;
      } else if (this.loopEligibilityUsed == 'oneSevenFive') {
        return this.loopBase * 1.75 * this.currentTaxRate;
      } else {
        return this.rawPayment;
      }
    },
    loopAssessmentCap() {
      if (this.loopEligibilityUsed == 'oneFive') {
        return dollarUSLocale.format(this.loopBase * 1.5);
      } else if (this.loopEligibilityUsed == 'oneSevenFive') {
        return dollarUSLocale.format(this.loopBase * 1.75);
      } else {
        return null;
      }
    },
    loopOverride() {
      if (this.loopBase > this.selectedYearValue) {
        return true;
      } else {
        return false;
      }
    },
    taxableValue() {
      let value = '';
      let marketValueUsed;
      if (this.assessmentHistory && this.assessmentHistory.length > 0) {
        let assessmentData = this.assessmentHistory.filter(item => item.year == parseInt(this.selectedTaxYear))[0];
        if (this.currentSelected) {
          marketValueUsed = assessmentData.market_value
            - assessmentData.exempt_land
            - assessmentData.exempt_building
        } else if (this.noneSelected) {
          marketValueUsed = assessmentData.market_value;
        } else if (this.homesteadSelected) {
          marketValueUsed = assessmentData.market_value - this.homesteadDeduction[this.selectedTaxYear];
          // console.log('taxableValue is running, marketValueUsed:', marketValueUsed, 'this.homestead:', this.homestead, 'exempt_land: ', this.activeOpaData.exempt_land, 'exempt_improvement: ', this.activeOpaData.exempt_building, this.activeOpaData);
        } else if (this.loopSelected) {
          if (this.loopEitherEligible) {
            if (this.loopOverride) {
              marketValueUsed = this.rawPayment;
            } else {
              marketValueUsed = this.loopCurrentYearPayment;
            }
          } else {
            marketValueUsed = 'Not eligible';
          }
        } else if (this.lowIncomeSelected) {
          let lastYear = this.assessmentValuesByYear[this.selectedTaxYear-1] - this.homesteadDeduction[this.selectedTaxYear-1];
          let thisYear = this.assessmentValuesByYear[this.selectedTaxYear] - this.homesteadDeduction[this.selectedTaxYear];
          marketValueUsed = thisYear > lastYear ? lastYear : thisYear;
        } else if (this.seniorSelected) {
          marketValueUsed = this.assessmentValuesByYear[this.selectedSeniorYear] - this.homesteadDeduction[this.selectedSeniorYear];
        }
      }
      marketValueUsed = marketValueUsed < 0 ? 0 : marketValueUsed;
      if (!this.loopSelected) {
        value = isNaN(marketValueUsed) ? marketValueUsed : dollarUSLocale.format(marketValueUsed * this.currentTaxRate);
      } else {
        value = isNaN(marketValueUsed) ? marketValueUsed : dollarUSLocale.format(marketValueUsed);
      }
      return value;
    },
    // eligibleDeferral() {
    //   let value;
    //   if (this.selectedTaxYear == '2024') {
    //     value = "may be";
    //   } else {
    //     value = 'is not';
    //   }
    //   return value;
    // },
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
  },
  watch: {
    selectedTaxYear(newYear, oldYear) {
      // console.log('oldYear:', oldYear, 'newYear:', newYear, 'this.selectedSeniorYear:', this.selectedSeniorYear);
      if (this.selectedSeniorYear > newYear) {
        this.selectedSeniorYear = newYear;
      }
    },
  },
}

</script>

<style>

.exception-note {
  font-weight: bold;
  max-width: 260px;
  padding: 0px !important;
  margin-left: 0px !important;
}

</style>