<template>
    <div :style="{width:scrollWidth}" ref="marquee" class="marquee">
        <ul :style="{transition:transition}" ref="marqueelist" class="marquees fix" :data-timerId="timerId">
            <li v-for="(item,index) in list" :key="'m'+index" class="marquee-item">{{item}}</li>
        </ul>
    </div>
</template>
<style lang="sass" scoped>
    .fix:after { display: table; content: ''; clear: both; }
    .marquee{overflow:hidden;}
    .marquees{list-style:none;padding-left:0;}
    .marquee-item{float:left;}
</style>
<script>
export default {
    name:'c-marquee',
    props:{
        data:{
            type:Array,
            default:[]
        },
        direction:{
            type:String,
            default:'left'
        },
        step:{
            type:Number,
            required:true
        },
        interval:{
            type:Number,
            default:3000
        },
        spent:{
            type:Number,
            default:500
        },
        loop:{
            type:Number,
            default:0
        },
        hoverPause:{
            type:Boolean,
            default:false
        },
        stream:{
            type:Boolean,
            default:true
        },
        scrollWidth:{
            type:String,
            default:'auto'
        }
    },
    data(){
        return {
           timerId:'',
           jsTransform:'',
           jsTransition:'',
           list:this.data,
           stepD:this.step,
           intervalD:this.interval
        }
    },
    computed:{
        transition(){
            return this.stream ? '' : 'all ' + this.spent + 'ms linear';
        }
    },
    watch:{
        data:{
            immediate:true,
            handler(val){
                if(val && val.length){
                    this.list = val;
                    this.$nextTick(() => {
                        this.init();
                    });
                }
            }
        }
    },
    created(){
        
    },
    mounted(){
        
    },
    destroyed(){
        
    },
    methods:{
        init(){
            var self = this,
                prefixer = self.prefixer(),
                jsTransform = prefixer.transform(),
                jsTransition = prefixer.transition();

            var con = self.$refs.marquee,
                scrollObj = self.$refs.marqueelist,
                scrollW = scrollObj.offsetWidth,
                scrollH = scrollObj.offsetHeight,
                children = scrollObj.children,
                len = children.length,
                itemHeight = scrollH / len,
                itemWidth = children[0].offsetWidth,
                conWidth = con.offsetWidth,
                conHeight = con.offsetHeight;
            
            if(self.stream){
                self.intervalD = 1000/60;
                self.stepD = 1;
            }
            var dir = jsTransform;
            var step = self.stepD;
            switch (self.direction) {
                case 'left':
                    if(step == 1 && conWidth > len * itemWidth){
                        return;
                    }
                    scrollObj.style[jsTransform] = 'translate(0,0) translateZ(0)';
                    scrollObj.style['width'] = 2*len*itemWidth + 'px';
                    con.style['width'] = len * itemWidth + 'px';
                    step = -(step || itemWidth);
                    break;
                case 'right':
                    if(step == 1 && conWidth > len * itemWidth){
                        return;
                    }
                    scrollObj.style[dir] = 'translate(' + (-len*itemWidth) + 'px,0) translateZ(0)';
                    scrollObj.style['width'] = 2*len*itemWidth + 'px';
                    con.style['width'] = len*itemWidth + 'px';
                    step = step || itemWidth;                            
                    break;
                case 'up':
                    if(step == 1 && conHeight > scrollH){
                        return;
                    }
                    scrollObj.style[dir] = 'translate(0,0) translateZ(0)';
                    scrollObj.style['height'] = 2*scrollH + 'px'; 
                    con.style['height'] = scrollH + 'px';
                    step = -(step || itemHeight);                               
                    break;
                case 'down':
                    if(step == 1 && conHeight > scrollH){
                        return;
                    }
                    scrollObj.style[dir] = 'translate(0,' + (-scrollH) + 'px) translateZ(0)';
                    scrollObj.style['height'] = 2*scrollH + 'px';
                    con.style['height'] = scrollH + 'px'; 
                    step = step || itemHeight;                               
                    break;
                default:
                    throw new Error('not support direction');
            }
            //复制一遍节点
            this.list = this.list.concat(this.list);
            //先移除先前的timer，再开启新的timer
            this.fClearTimer();
            var counter = 0;
            var timerId = setInterval(function(){
                if(parseInt(scrollObj.getAttribute('data-pause'))){
                    return;
                }
                counter++;
                if(self.loop >0 && counter >= self.loop){
                    clearInterval(timerId);
                }
                self.fScrollObj(scrollObj,step,itemWidth,scrollH,dir,len);
            },self.intervalD);
            if(self.hoverPause){
                scrollObj.onmouseover = function(){
                    this.setAttribute("data-pause", 1);
                }
                scrollObj.onmouseout = function(){
                    this.setAttribute("data-pause", 0);
                }
            }
        },
        fScrollObj(scrollObj,step,itemWidth,scrollH,dir,len){
            var self = this,
                transform = scrollObj.style[dir],
                offset = 0,
                jsTransition = self.jsTransition;
            //alert(3333);                         
            switch(self.direction){
                case 'left':
                    offset = self.fGetTranslate(transform,'x');
                    if(offset <= -len*itemWidth){
                        // scrollObj.style[jsTransition] = '';
                        self.fClearTransiton(scrollObj,jsTransition);
                        scrollObj.style[dir] = 'translate(0,0) translateZ(0)';
                        offset = 0;
                    }
                    else{
                        offset += step;
                        self.fScrollTransform(scrollObj,dir,offset,'x');
                    }
                    break;
                case 'right':
                    offset = self.fGetTranslate(transform,'x');
                    if(offset >= 0){
                        self.fClearTransiton(scrollObj,jsTransition);
                        scrollObj.style[dir] = 'translate(' + -len*itemWidth + 'px,0) translateZ(0)';
                        offset = -len*itemWidth;
                    }
                    else{
                        offset += step;
                        self.fScrollTransform(scrollObj,dir,offset,'x');
                    }
                    break;
                case 'up':
                    offset = self.fGetTranslate(transform,'y');
                    if(offset <= -scrollH){
                        //scrollObj.style[jsTransition] = '';
                        self.fClearTransiton(scrollObj,jsTransition);
                        scrollObj.style[dir] = 'translate(0,0) translateZ(0)';
                        offset = 0;
                    }
                    else{
                        offset += step;
                        self.fScrollTransform(scrollObj,dir,offset,'y');
                    }
                    break;
                case 'down':
                    offset = self.fGetTranslate(transform,'y');
                    if(offset >= 0){
                        //scrollObj.style[jsTransition] = '';
                        self.fClearTransiton(scrollObj,jsTransition);
                        scrollObj.style[dir] = 'translate(0,' + -scrollH + 'px) translateZ(0)';
                        offset = -scrollH;
                    }
                    else{
                        offset += step;
                        self.fScrollTransform(scrollObj,dir,offset,'y');
                    }
                    break;
                default:
                    throw new Error('not support direction');
            }
        },
        fScrollTransform(scrollObj,dir,offset,type){
            //this.fSetTransition(scrollObj,this.jsTransition);
            if(type == 'x'){
                scrollObj.style[dir] = 'translate(' + offset + 'px,0) translateZ(0)';
            }
            else{
                scrollObj.style[dir] = 'translate(0,' + offset + 'px) translateZ(0)';
            }
        },
        // fSetTransition(scrollObj,jsTransition){
        //     var self = this;
        //     console.log('stream ' + self.stream);
        //     if(self.stream){
        //         // scrollObj.style['webkitTransitionTimingFunction'] = 'cubic-bezier(0.165, 0.84, 0.44, 1)';
        //         scrollObj.style['webkitTransitionDuration'] = '0ms';
        //     }
        //     else{
        //         scrollObj.style[jsTransition] = 'all ' + self.spent/1000 + 's';
        //         console.log('transition ' + scrollObj.style[jsTransition]);                
        //     }
        // },
        fClearTransiton(scrollObj,jsTransition){
            scrollObj.style[this.jsTransition] = '';
            // scrollObj.style['webkitTransitionTimingFunction'] = '';
            // scrollObj.style['webkitTransitionDuration'] = '';
        },
        fGetTranslate(transform,type){
            var aTrans = transform.slice(10,-1).split(',');
            aTrans = aTrans.map(function(item){
                return parseInt(item);
            });
            switch(type){
                case 'x':
                    return aTrans.length > 0 ? aTrans[0] : '';
                case 'y':
                    return aTrans.length > 1 ? aTrans[1] : '';
                case 'z':
                    return aTrans.length > 2 ? aTrans[2] : '';
                default:
                    break;
            }
            return aTrans;
        },
        fClearTimer(){
            clearInterval(this.timerId);
            this.timerId = '';
        },
        prefixer:function(){
            var prefixer = {},
            oStyle = document.head.style,
            aEvents = {
                'transform': {
                    'transform': 'transform',
                    'webkitTransform': 'webkitTransform',
                    'MozTransform': 'MozTransform',
                    'msTransform': 'msTransform',
                    'OTransform': 'OTransform'
                },
                'transition': {
                    'transition': 'transition',
                    'webkitTransition': 'webkitTransition',
                    'MozTransition': 'MozTransition',
                    'msTransition': 'msTransition',
                }
            },
            fGetEvent = function(sEventName) {
                sEventName = (sEventName || '').toLowerCase();
                if (!aEvents[sEventName]) {
                    throw new Error('prefix: unkown event name ' + sEventName);
                }
                for (var p in aEvents[sEventName]) {
                    if (typeof(oStyle[p]) !== undefined) {
                        return aEvents[sEventName][p];
                    }
                }
                return '';
            };
        
            prefixer.transform = function(){
                return fGetEvent('transform');
            } 
            prefixer.transition = function(){
                return fGetEvent('transition');
            }
            
            return prefixer;
        }
    },
    components:{
        
    }
}
</script>
