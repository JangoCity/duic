import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuetify from 'vuetify'
import VueClipboard from 'vue-clipboard2'
// ===================================================================================================
import 'vuetify/dist/vuetify.css'

import Main from './pages/Main.vue'
// ===================================================================================================
import axios from 'axios'
// ===================================================================================================
import {router} from './router/index'
import {store} from "./store/index"

Vue.use(VueRouter)
Vue.use(Vuetify)
Vue.use(VueClipboard)

/**
 * 初始化 Vue。
 */
new Vue({
    el: "#app",
    render: h => h(Main),
    router,
    store
})

/**
 * 增加 axios 拦截器。
 */
axios.interceptors.response.use((response) => {
    return response
}, (error) => {
    // 未认证
    if (error.response) {
        if (!error.config.apiTest && error.response.status === 401) {
            store.commit('loginState', false)
        }
    } else {
        console.error(error)
        alert('连接超时，请重试')
    }
    return Promise.reject(error)
})

// ===================================================================================================
/**
 * 通知。
 * @param text 通知文本
 * @param ops 选项
 */
Vue.prototype.$notice = function (text, ops) {
    const props = ops || {top: true, color: 'error'}
    props.value = true

    const instance = new Vue({
        render(h) {
            return h('v-snackbar', {
                props: props,
                on: {
                    input() {
                        instance.$el.remove()
                    }
                }
            }, text)
        }
    })

    const component = instance.$mount()
    document.body.appendChild(component.$el)
}

/**
 * vuetify confirm 实现。
 * @param text 提示文本
 * @param confirmFun 确认回调函数
 * @param cancelFun 取消回调函数
 */
Vue.prototype.$confirm = function (text, confirmFun, cancelFun) {
    const instance = new Vue({
        template: `<v-dialog v-model="value" max-width="290">
    <v-card>
        <v-card-title primary-title class="title">确认</v-card-title>
        <v-card-text class="body-2">${text}</v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn flat color="info" @click="cancel" name="confirm__cancel">取消</v-btn>
            <v-btn flat color="success" @click="confirm" name="confirm__confirm">确认</v-btn>
        </v-card-actions>
    </v-card>
</v-dialog>`,
        data: {
            value: true
        },
        methods: {
            confirm() {
                this.c(confirmFun)
            },
            cancel() {
                this.c(cancelFun)
            },
            c(f) {
                instance.value = false
                instance.$el.remove()
                f && f()
            }
        },
        watch: {
            value() {
                this.cancel()
            }
        }
    })

    const component = instance.$mount()
    document.body.appendChild(component.$el)
}
