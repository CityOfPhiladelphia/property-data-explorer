<template>
  <div
    :class="'pvm-search-control-container ' + containerClass"
    :style="containerStyle"
  >
    <form
      id="search-form"
      autocomplete="off"
      class="pvm-search-control-form"
      @submit.prevent="handleSearchFormSubmit"
    >
      <label
        :for="inputID"
        class="accessible"
      >search form</label>
      <input
        :id="inputID"
        :class="'pvm-search-control-input ' + inputClass"
        :style="inputStyle"
        :placeholder="$props.placeholder || 'Search the map'"
        :value="addressEntered"
        tabindex="0"
        autocomplete="off"
        @input="onInput"
        @keydown.down.prevent="focusFirstCandidate"
        @keydown.esc="hideCandidates"
      >
    </form>
    <button
      v-if="addressEntered != '' && addressEntered != null"
      :class="'pvm-search-control-button ' + buttonClass"
      aria-label="clear search"
      title="clear search"
      @click="clear"
    >
      <font-awesome-icon icon="times" />
    </button>
    <button
      :class="'pvm-search-control-button ' + buttonClass"
      name="pvm-search-control-button"
      tabindex="-1"
      aria-label="search"
      title="search"
      @click="handleSearchFormSubmit"
    >
      <font-awesome-icon icon="search" />
    </button>
    <ul
      v-if="candidates.length && shouldShowCandidates"
      ref="candidateList"
      class="ais-candidate-list"
      role="listbox"
      @keydown="onListKeydown"
    >
      <li
        v-for="(candidate, i) in candidates"
        :id="'ais-candidate-' + i"
        :key="candidate"
        class="ais-candidate-item"
        role="option"
        tabindex="-1"
        @click="selectCandidate(candidate)"
        @keydown.enter.prevent="selectCandidate(candidate)"
      >
        {{ candidate }}
      </li>
    </ul>
  </div>
</template>

<script>
import generateUniqueId from '@phila/vue-mapping/src/util/unique-id';

const AIS_AUTOCOMPLETE_URL =
  'https://ais-autocomplete.citygeo.phila.city/autocomplete';
const DEBOUNCE_MS = 250;
const MIN_QUERY_LENGTH = 3;

export default {
  name: 'AddressSearchAutocomplete',
  props: [
    'widthFromConfig',
    'placeholder',
    'static',
  ],
  data() {
    return {
      containerStyle: { width: '305px' },
      inputStyle: { width: '250px' },
      inputID: generateUniqueId(),
      addressEntered: null,
      candidates: [],
      shouldShowCandidates: false,
      _debounceTimer: null,
    };
  },
  computed: {
    inputClass() {
      return this.isMobileOrTablet ? 'pvm-input-mobile' : 'pvm-input-non-mobile';
    },
    containerClass() {
      return this.isMobileOrTablet ? 'pvm-container-mobile' : 'pvm-container-non-mobile';
    },
    buttonClass() {
      return this.isMobileOrTablet ? 'pvm-button-mobile' : 'pvm-button-non-mobile';
    },
    isMobileOrTablet() {
      return this.$store.state.isMobileOrTablet;
    },
    autocompleteMax() {
      if (this.$config.addressInput && this.$config.addressInput.autocompleteMax) {
        return this.$config.addressInput.autocompleteMax;
      }
      return 15;
    },
  },
  watch: {
    addressEntered() {
      this.handleWindowResize();
    },
  },
  created() {
    window.addEventListener('resize', this.handleWindowResize);
    this.handleWindowResize();
    if (this.$config.defaultAddress) {
      this.addressEntered = this.$config.defaultAddress;
    }
  },
  mounted() {
    document.addEventListener('mousedown', this.onDocumentMouseDown);
  },
  beforeDestroy() {
    document.removeEventListener('mousedown', this.onDocumentMouseDown);
    window.removeEventListener('resize', this.handleWindowResize);
    if (this.$data._debounceTimer) {
      clearTimeout(this.$data._debounceTimer);
    }
  },
  methods: {
    onInput(e) {
      const value = e.target.value;
      this.addressEntered = value;
      if (this.$data._debounceTimer) {
        clearTimeout(this.$data._debounceTimer);
      }
      this.$data._debounceTimer = setTimeout(() => {
        this.fetchCandidates(value);
      }, DEBOUNCE_MS);
    },
    async fetchCandidates(query) {
      if (!query || query.length < MIN_QUERY_LENGTH) {
        this.candidates = [];
        this.shouldShowCandidates = false;
        return;
      }
      try {
        const url = AIS_AUTOCOMPLETE_URL + '?q=' + encodeURIComponent(query);
        const res = await fetch(url);
        const data = await res.json();
        if (!data || !data.count) {
          this.candidates = [];
          this.shouldShowCandidates = false;
          return;
        }
        this.candidates = data.results.addresses
          .slice(0, this.autocompleteMax)
          .map((a) => a.address);
        this.shouldShowCandidates = this.candidates.length > 0;
      } catch (err) {
        console.warn('AIS autocomplete error:', err);
        this.candidates = [];
        this.shouldShowCandidates = false;
      }
    },
    selectCandidate(candidate) {
      this.addressEntered = candidate;
      this.candidates = [];
      this.shouldShowCandidates = false;
      this.$emit('handle-search-form-submit', candidate);
    },
    hideCandidates() {
      this.shouldShowCandidates = false;
    },
    focusFirstCandidate() {
      if (!this.candidates.length) return;
      this.shouldShowCandidates = true;
      this.$nextTick(() => {
        const first = document.getElementById('ais-candidate-0');
        if (first) first.focus();
      });
    },
    onListKeydown(e) {
      const id = e.target.id || '';
      const match = id.match(/^ais-candidate-(\d+)$/);
      if (!match) return;
      const index = parseInt(match[1], 10);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = Math.min(index + 1, this.candidates.length - 1);
        const nextEl = document.getElementById('ais-candidate-' + next);
        if (nextEl) nextEl.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (index === 0) {
          document.getElementById(this.inputID).focus();
        } else {
          const prev = document.getElementById('ais-candidate-' + (index - 1));
          if (prev) prev.focus();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.hideCandidates();
        document.getElementById(this.inputID).focus();
      }
    },
    onDocumentMouseDown(e) {
      if (!this.shouldShowCandidates) return;
      if (this.$el && !this.$el.contains(e.target)) {
        this.hideCandidates();
      }
    },
    clear() {
      this.addressEntered = '';
      this.candidates = [];
      this.shouldShowCandidates = false;
    },
    handleSearchFormSubmit() {
      const value = this.addressEntered || '';
      this.candidates = [];
      this.shouldShowCandidates = false;
      this.$emit('handle-search-form-submit', value);
    },
    handleWindowResize() {
      const addressEntered = this.addressEntered;
      const width = this.$props.widthFromConfig;
      if (window.innerWidth >= 850) {
        this.containerStyle.width = width + 'px';
        this.inputStyle.width =
          (addressEntered === '' || addressEntered === null ? width - 55 : width - 108) + 'px';
      } else if (window.innerWidth >= 750 && !this.$props.static) {
        this.containerStyle.width = (width - 100) + 'px';
        this.inputStyle.width =
          (addressEntered === '' || addressEntered === null ? width - 155 : width - 208) + 'px';
      } else {
        this.containerStyle.width = '280px';
        this.inputStyle.width =
          (addressEntered === '' || addressEntered === null ? '225px' : '172px');
      }
    },
  },
};
</script>

<style scoped>
.accessible {
  position: absolute;
  left: -99999px;
  height: 10px;
  width: 10px;
}

.pvm-search-control-form {
  display: inline-block;
}

.pvm-search-control-container {
  position: absolute;
  display: flex;
  flex-wrap: wrap;
  left: 30px;
  top: 20px;
  border-radius: 2px;
  width: 305px;
  z-index: 900;
}

.pvm-container-non-mobile {
  height: 48px;
}

.pvm-container-mobile {
  height: 38px;
}

.pvm-search-control-input {
  display: inline-block;
  border: 0;
  padding: 15px;
  font-family: 'Montserrat', 'Tahoma', sans-serif;
  font-size: 16px;
  width: 250px;
  border-style: solid;
  border-color: #2176d2;
  border-width: 2px;
}

.pvm-input-non-mobile {
  height: 48px;
}

.pvm-input-mobile {
  height: 38px;
}

.pvm-search-control-button {
  display: inline-block;
  color: #fff;
  background: #2176d2;
  padding: 0px;
  width: 50px;
  margin-right: 1.5px;
}

.pvm-button-non-mobile {
  height: 48px;
  line-height: 48px;
}

.pvm-button-mobile {
  height: 38px;
  line-height: 38px;
  padding-top: 1px;
}

.ais-candidate-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 5px;
  margin: 1px 0 0 0;
  padding: 0;
  list-style: none;
  background-color: #fff;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 4px 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  max-height: 15rem;
  overflow-y: auto;
  z-index: 10;
}

.ais-candidate-item {
  padding: 0.6rem 0.75rem;
  cursor: pointer;
  color: #000;
  font-family: 'Montserrat', 'Tahoma', sans-serif;
  font-size: 14px;
  outline: none;
}

.ais-candidate-item:hover,
.ais-candidate-item:focus {
  background-color: #ffefa2;
  font-weight: bold;
}
</style>
