import accounting from 'accounting';
// import { format } from 'date-fns';
import { format, parseISO } from 'date-fns';

accounting.settings.currency.precision = 0;

export default {
  bold: {
    transform: function (value) {
      return '<strong>' + value + '</strong>';
    },
  },
  booleanToYesNo: {
    transform: function(value) {
      return value ? 'Yes' : 'No';
    },
  },
  thousandsPlace: {
    transform: function(value) {
      var number = String(value).match(/\d+/)[0].replace(/(.)(?=(\d{3})+$)/g,'$1,');
      var label = String(value).replace(/[0-9]/g, '') || '';
      return number + ' ' + label;
    },
  },
  currency: {
    // a list of global objects this transform depends on
    globals: [ 'accounting' ],
    // this is the function that gets called to perform the transform
    transform: function (value, globals) {
      // console.log('currency transform, value:', value);
      // var accounting = globals.accounting;
      return accounting.formatMoney(value);
    },
  },
  date: {
    // transform: function (value, globals) {
    //   console.log('in date transform, value:', value)
    //   if (format(parseISO(value), 'MM/dd/yyyy') === 'Invalid Date' ) {
    //     return value;
    //   }
    //   return format(parseISO(value), 'MM/dd/yyyy');
    //
    // },
    transform: function (value) {
      let valueTransformed;
      // console.log('date transform running, value:', value, 'typeof value:', typeof value);
      if (value === 'Date Not Available') {
        valueTransformed = value;
      } else if (typeof value === 'string') {
        valueTransformed = format(parseISO(value), 'MM/dd/yyyy');
      } else {
        valueTransformed = format(value, 'MM/dd/yyyy');
      }
      return valueTransformed;
    },
  },
  dayofweek: {
    // a list of global objects this transform depends on
    transform: function (value) {
      switch(value) {
      case "FRI":
        value = "Friday";
        break;
      case "SAT":
        value = "Saturday";
        break;
      case "SUN":
        value = "Sunday";
        break;
      case "MON":
        value = "Monday";
        break;
      case "TUE":
        value = "Tuesday";
        break;
      case "WED":
        value = "Wednesday";
        break;
      case "THU":
        value = "Thursday";
      }
      return value;
    },
  },
  feet: {
    transform: function (value) {
      return value && value + ' ft';
    },
  },
  getNearest: {
    transform: function(state, field, distName) {
      let min = Math.min.apply(null, state.sources[field].data.map(function(item) {
        return item[distName];
      }));
      let result  = state.sources[field].data.filter(function(item){
        return item[distName] == min;
      } );
      let nearest = result? result[0] : null;
      return nearest;
    },
  },
  integer: {
    transform: function (value) {
      return !isNaN(value) && parseInt(value);
    },
  },
  nowrap: {
    transform: function (value) {
      return '<span style="white-space: nowrap;">' + value + '</span>';
    },
  },
  nth: {
    transform: function(n) {
      return n + ([ ,'st','nd','rd' ][n%100>>3^1&&n%10]||'th');
    },
  },
  phoneNumber: {
    transform: function (value) {
      var s2 = (""+value).replace(/\D/g, '');
      var m = s2.match(/^(\d{3})(\d{3})(\d{4})$/);
      return (!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3];
    },
  },
  prettyNumber: {
    transform: function (value) {
      return !isNaN(value) && value.toLocaleString();
    },
  },
  rcoPrimaryContact: {
    transform: function (value) {
      var PHONE_NUMBER_PAT = /\(?(\d{3})\)?( |-)?(\d{3})(-| )?(\d{4})/g;
      var m = PHONE_NUMBER_PAT.exec(value);

      // check for non-match
      if (!m) {
        return value;
      }

      // standardize phone number
      var std = [ '(', m[1], ') ', m[3], '-', m[5] ].join('');
      var orig = m[0];
      var valueStd = value.replace(orig, std);

      return valueStd;
    },
  },
  squareFeet: {
    transform: function (value) {
      return value && value + ' sq ft';
    },
  },
  titleCase: {
    transform: function(str) {
      let value;
      if (str) {

        let titleCaseFix = {
          Llc: "LLC",
          Iii: "III",
          Lp: "LP",
          Usa: "USA",
          Trs: "TRS",
          "H/w": "H/W",
          Of: "of",
          Fdr: "FDR",
          "S/w": "S/W",
          Mcclellan: "McClellan",
          "S/m": "S/M",
          And: "and",
          Cp: "CP",
          Us: "US",
          Ltd: "LTD",
          Al: 'AL',
          Ak: 'AK',
          Az: 'AZ',
          Ar: 'AR',
          Ca: 'CA',
          Co: 'CO',
          Ct: 'CT',
          De: 'DE',
          Fl: 'FL',
          Ga: 'GA',
          Hi: 'HI',
          Id: 'ID',
          Il: 'IL',
          In: 'IN',
          Ia: 'IA',
          Ks: 'KS',
          Ky: 'KY',
          La: 'LA',
          Me: 'ME',
          Md: 'MD',
          Ma: 'MA',
          Mi: 'MI',
          Mn: 'MN',
          Ms: 'MS',
          Mo: 'MO',
          Mt: 'MT',
          Ne: 'NE',
          Nv: 'NV',
          Nh: 'NH',
          Nj: 'NJ',
          Nm: 'NM',
          Ny: 'NY',
          Nc: 'NC',
          Nd: 'ND',
          Oh: 'OH',
          Ok: 'OK',
          Or: 'OR',
          Pa: 'PA',
          Ri: 'RI',
          Sc: 'SC',
          Sd: 'SD',
          Tn: 'TN',
          Tx: 'TX',
          Ut: 'UT',
          Vt: 'VT',
          Va: 'VA',
          Wa: 'WA',
          Wv: 'WV',
          Wi: 'WI',
          Wy: 'WY',
        };

        let fixit = function(str) {
          for (let oldCase in titleCaseFix) {
            let newCase = titleCaseFix[oldCase];
          }
          return str;
        };

        str = str.toLowerCase().split(' ').map(function(word) {
          let wordFormatted = word.charAt(0).toUpperCase() + word.slice(1);
          wordFormatted = titleCaseFix[wordFormatted] || wordFormatted;
          return wordFormatted;
        });

        value = str.join(' ');
      }
      return value;
    },
  },
  urlFormatter: {
    transform: function(txt) {
      var uselessWordsArray =
        [
          "http//", "http://", "https://", "www.", "//", "//:",
        ];
      var expStr = uselessWordsArray.join("|");
      return txt.replace(new RegExp(expStr, 'gi'), '');
    },
  },
};
