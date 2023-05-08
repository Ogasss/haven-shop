import { component } from "../hooks/setComponent"

component.setComponent('home-title','home-title')
component.setComponent('home-search','home-search')

component.setComponent('home-nav','home-nav').then(()=>{
    component.setScript('home-nav')
})
component.setComponent('home-tops','home-tops').then(()=>{
    component.setComponent('home-main','home-main').then(()=>{
        component.setScript('home-main')
    })
})
