<template>
  <footer class="app-footer cell shrink">
    <div class="grid-x align-middle">
      <div class="cell">
        <nav>
          <ul class="footer-nav">
            <li><a href="https://www.phila.gov">City of Philadelphia</a></li>
            <li>
              <popover-link
                :options="popoverLinkOptions"
                :slots="popoverLinkSlots"
              />
              <!-- :customStyle="this.customStyle" -->
              <!-- <a
                href=""
                @click.prevent="$emit('howToUseLink')"
              >How to use</a> -->
            </li>
            <li>
              <a
                :href="feedbackLink"
                target="_blank"
              >Feedback</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </footer>
</template>
<script>

import ModalAbout from './ModalAbout.vue';

export default {
  components: {
    ModalAbout,
    PopoverLink: () => import(/* webpackChunkName: "lblb_pvc_PopoverLink" */'@phila/vue-comps/src/components/PopoverLink.vue'),
  },
  props: {
    feedbackLink: {
      type: String,
      default: 'https://cityofphila.typeform.com/to/MBB0EW',
    },
  },
  computed: {
    popoverLinkOptions() {
      return {
        height: '92%',
        customStyle: { 'color': 'white', 'border-bottom': '0px' },
        components: [
          {
            type: 'modal-about',
          },
        ],
      };
    },
    popoverLinkSlots() {
      return {
        shouldShowValue: false,
        value: 'How to use',
      };
    },
  },
};
</script>
<style lang="scss">

.app-footer{
  vertical-align: middle;
  background: color(dark-ben-franklin);
  text-align: center;
  /*needed for IE11*/
  z-index: 1000;
  a:link, a:visited{
    color: white;
  }
  a:hover, a:active{
    color: color(electric-blue);
  }

  .footer-nav {
    // margin: .5rem 0;
    padding: 0;
  }

  .footer-nav li{
    display: inline-block;
    padding: 0 1rem;
    border-right: solid 1px #fff;
    &:last-of-type{
      border: none;
    }
  }
}

</style>
