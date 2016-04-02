// es5, 6, and 7 polyfills, powered by babel
import polyfill from "babel-polyfill"

//
// fetch method, returns es6 promises
// if you uncomment 'universal-utils' below, you can comment out this line
import fetch from "isomorphic-fetch"

// universal utils: cache, fetch, store, resource, fetcher, router, vdom, etc
// import * as u from 'universal-utils'

// the following line, if uncommented, will enable browserify to push
// a changed fn to you, with source maps (reverse map from compiled
// code line # to source code line #), in realtime via websockets
// -- browserify-hmr having install issues right now
// if (module.hot) {
//     module.hot.accept()
//     module.hot.dispose(() => {
//         app()
//     })
// }

// Check for ServiceWorker support before trying to install it
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('./serviceworker.js').then(() => {
//         // Registration was successful
//         console.info('registration success')
//     }).catch(() => {
//         console.error('registration failed')
//             // Registration failed
//     })
// } else {
//     // No ServiceWorker Support
// }

import DOM from 'react-dom'
import React, {Component} from 'react'
import $ from 'jquery'
import _ from 'underscore'
import Firebase from 'firebase'
import BackboneFire from 'bbfire'

var rootFbURL = 'https://bloglivesmatter.firebaseio.com/'
var fbRef = new Firebase(rootFbURL)



var SplashPage = React.createClass({


	_handleSignUp:function(event){

		console.log('event.currentTarget >>>>>>>>>>>>>>>>>', event.currentTarget)

		event.preventDefault()

		var emailInput = event.currentTarget.email.value
		var passWdInput = event.currentTarget.password.value
		var fstName = event.currentTarget.firstName.value
		var lstName = event.currentTarget.lastName.value

		console.log('inputs >>>>>>>>>', emailInput, passWdInput, fstName, lstName )

		var newUser={
			email:emailInput,
			password: passWdInput
		}
		console.log('newUser >>>>>>>>>>>>>>>>', newUser)
		
		fbRef.createUser(newUser, function(err, authData){
			console.log('err and authdata >>>>>>>>>>>>>>>>',err, authData)
		})

	},

	_handleLogIn:function(event){
		event.PreventDefault()
		console.log(event)
	},


	render:function(){
		return(
			<div id='splashpage'>
				<form onSubmit={this._handleSignUp}>
					<h3 className='signUp'>Support Blog Lives !</h3>
					<input type='text' id='email' placeholder='john@email.com...'/><br/>
					<input type='password' id='password' placeholder='password...'/><br/><br/>
					<input type='text' id='firstName' placeholder='first name...'/><br/>
					<input type='text' id='lastName' placeholder='last name...'/><br/>
					<input className='button-primary' type='submit' placeholder='signup'/><br/>
				</form>

				<hr/>
				
				<form onSubmit={this._handleLogIn}>
					<h3 className='signin'>Log in Here</h3><br/>
					<input type='text' id='username' placeholder='Your Email'/><br/>
					<input type='password' id='password' placeholder='password'/><br/>
					<input className='button-primary' type='submit' placeholder='login'/><br/>
				</form>
			</div>
			)
	}
})


var BlogRouter =  BackboneFire.Router.extend({
	routes: {
		'bloglist':'handleBlogList',
		'createblog':'handleCreateBlog',
		'*splash':'handleSplashPage'
	},

	handleBlogList:function(){
			DOM.render(<Bloglist/>, document.querySelector('.container'))
	},

	handleCreateBlog:function(){
			DOM.render(<Createblog/>, document.querySelector('.container'))
	},

	handleSplashPage:function(){
			DOM.render(<SplashPage/>, document.querySelector('.container'))
	},

	initialize:function(){
		var rtr = this
		console.log('app is routing!')
		BackboneFire.history.start()
	}
})

var rtr = new BlogRouter()