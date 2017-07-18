import {groupBy} from 'lodash/collection'
import people from './people'
import './style.styl'
import img from './assets/x-30465_640.png'

const managerGroups = groupBy(people, 'manager')
const root = document.querySelector('#root')
root.innerHTML = `
    <pre>${JSON.stringify(managerGroups, null, 2)}</pre>
    <img src="${img}" alt=""/>
    <img src="Nightcore-Shadows.jpg" alt=""/>
`
