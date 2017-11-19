const { marquee } = VueMarquee;

new Vue({
  name:'c-app',
  el: '#container',
  created() {
      setTimeout(() => {
          this.list = ['第一条','第二条','第三条','第四条'];
      },3000);
  },
  data() {
    return {
      list:[],
      sWidth:'400px'
    }
  },
  components: {
    'c-marquee': marquee
  }
});