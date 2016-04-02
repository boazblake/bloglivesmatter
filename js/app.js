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

var BlogList = BackboneFire.Firebase.Collection.extend({
	url: '',
	initialize:function(){
		this.url = rootFbURL + 'bloglist/'
	}
})


var Header = React.createClass({
	render:function(){return(<div><h3 className='signUp'>Support Blog Lives !</h3></div>)}
})
var NavBar = React.createClass({

	_ButtonAction:function(evt){
		console.log(evt.currentTarget.value)
		var butAction = evt.currentTarget.value
		rtr.navigate(butAction, {trigger:true})
	},

	_genButtons:function(butType, ind){
		return (
			<button onClick={this._ButtonAction} value={butType} key={ind}>{butType}</button>
		)
	},

	render:function(){
		var component = this
		return (
		<div>
			{['logout','createblog', 'bloglist'].map(component._genButtons)}
		</div>
		)
	}
})

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
		// console.log('newUser >>>>>>>>>>>>>>>>', newUser)
		

		console.log('new FB user  >>>>>>>>>>>>>>>>', newUser)
		fbRef.createUser(newUser, function(err, authData){
			console.log('err>>>>>', err)
			console.log('authData>>>>>', authData)
				})



		rtr.navigate('#bloglist',{trigger:true})
	},

	_handleLogIn:function(event){
		event.preventDefault()
		// console.log('_handleLogIn', event)

		var authDataObject={
			email:event.currentTarget.username.value,
			password:event.currentTarget.password.value
		}
		console.log('authDataObject', authDataObject)


		fbRef.authWithPassword(authDataObject, function(err, authData){
			if (err) {
				alert('not signed in')
				console.log('err>>>>', err)
			} else {
				console.log('userAuthenticated>>>>>>', authData)
				rtr.navigate('#bloglist',{trigger:true})

			}
		})
	},


	render:function(){
		return(
			<div id='splashpage'>
			<Header/>

				<form onSubmit={this._handleSignUp}>
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

var Bloglist = React.createClass({
	
	getInitialState:function(){
		return (
			{ blogList:this.props.bloglist	}
			)
	},

	// componentDidMount:function(){
	// 	var component = this
	// 	component.props.bloglist.on('sync', function(){
	// 		componnent.setstate({
	// 			bloglist:component.props.bloglist
	// 		})
	// 	})
	// },

	render:function(){

		return (
			<div className='blogList'>
			<Header/>
			<NavBar/>
			<h2> Blog List Here</h2>

			</div>
		)
	}
})

var Createblog = React.createClass({
	_saveblog:function(evt){
		evt.preventDefault()
		// console.log('evt.currentTarget.title.value >>>>>', evt.currentTarget.title.value)
		// console.log('evt.currentTarget.blog.value >>>>>>', evt.currentTarget.blog.value)
 
		var blogObj = {
			title:evt.currentTarget.title.value,
			blog: evt.currentTarget.blog.value
		}

		var blogListColl = new BlogList()
		blogListColl.create({
			title:blogObj.title,
			blog:blogObj.blog,
		})


	},


	render:function(){
		return(
			<div>
				<Header/>
				<NavBar/>
				<form onSubmit={this._saveblog}>
					<input type='text' id='title' placeholder='Title...'/><br/>
					<input type='textarea' id='blog' placeholder='blog away...'/><br/><br/>
					<input className='button-primary' type='submit'/>
				</form>
			</div>

			)
	}

})


var BlogRouter =  BackboneFire.Router.extend({
	routes: {
		'bloglist':'handleBlogList',
		'createblog':'handleCreateBlog',
		'logout': 'handleLogOut',
		'*splash':'handleSplashPage'
	},

	handleLogOut:function(evt){
		fbRef.unauth()
		this.navigate('splash',{trigger:true})
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