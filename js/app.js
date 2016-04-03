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
		this.url = rootFbURL + 'bloglist/' + rtr.userId + '/'
		console.log('this.url>>>>>>>>', this.url)
	}
})

var Header = React.createClass({
	render:function(){return(<div><h3 className='header'>Blog Lives Matter !</h3></div>)}
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

	_showSignIn:function(evt){
		if (document.querySelector('.sign').style.display !== 'block') {
			document.querySelector('.sign').style.display = 'block'
			return
		} else if (document.querySelector('.sign').style.display === 'block'){
			document.querySelector('.sign').style.display = 'none'
		}
	},


	_handleSignUp:function(event){

		console.log('event.currentTarget >>>>>>>>>>>>>>>>>', event.currentTarget)

		event.preventDefault()

		var emailInput = event.currentTarget.email.value
		var passWdInput = event.currentTarget.password.value
		var fstName = event.currentTarget.firstName.value
		var lstName = event.currentTarget.lastName.value

		if ( (emailInput === '') || (passWdInput === '') ||  (fstName === '') ||  (lstName === '') ) {
			return alert('please fill in all' )
		}

		console.log('inputs >>>>>>>>>', emailInput, passWdInput, fstName, lstName )

		var newUser={
			email:emailInput,
			password: passWdInput
		}
		// console.log('newUser >>>>>>>>>>>>>>>>', newUser)
		

		console.log('new FB user  >>>>>>>>>>>>>>>>', newUser)
			
		fbRef.createUser(newUser, function(err, authData){
			console.log('err>>>>>', [err])
			console.log('authData>>>>>', authData)
					// debugger
				if (err) {
					alert(err.message)
				} else {
					rtr.navigate('#bloglist',{trigger:true})
				}
				})
		
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
				console.log('rtr>>>>>>>',rtr)
				console.log('userAuthenticated>>>>>>', authData)
				rtr.userId = authData.uid
				console.log('authData.uid>>>>>>', authData.uid)
				console.log('rtr.userId>>>>>>', rtr.userId)
				rtr.navigate('#bloglist',{trigger:true})

			}
		})
	},


	render:function(){
		return(
			<div id='splashpage'>
			<Header/>
				<form onSubmit={this._handleSignUp}>
					<h3 onClick={this._showSignIn} className='signin'>Sign Up Here</h3>
					<div className='sign'>
						<input type='text' id='email' placeholder='john@email.com...'/><br/>
						<input type='password' id='password' placeholder='password...'/><br/><br/>
						<input type='text' id='firstName' placeholder='first name...'/><br/>
						<input type='text' id='lastName' placeholder='last name...'/><br/>
						<input className='button-primary' type='submit' placeholder='signup'/><br/>
					</div>
				</form>
				<hr/>
				<form onSubmit={this._handleLogIn}>
					<h3 className='signin'>Log in Here</h3><br/>
					<div className='log'>
						<input type='text' id='username' placeholder='Your Email'/><br/>
						<input type='password' id='password' placeholder='password'/><br/>
						<input className='button-primary' type='submit' placeholder='login'/><br/>
					</div>
				</form>
			</div>
			)
	}
})
var Bloglist = React.createClass({

	_showBlogPost:function(evt){
		// var chosenBlog = evt.currentTarget
		// console.log([chosenBlog])
		var blogHeight = document.querySelector('.blogWrapper').style.height

		console.log('blogHeight>>>>>', [document.querySelector('.blogWrapper').style.height])
		if (document.querySelector('.blogWrapper').style.height !== 'auto') {
			document.querySelector('.blogWrapper').style.height = 'auto'
			return
		} else if (document.querySelector('.blogWrapper').style.height === 'auto'){
			 document.querySelector('.blogWrapper').style.height = '150px'
		}
	},
	
	getInitialState:function(){
		return { 
			blogList:this.props.bloglist
		}
			
	},

	_displayBlogPosts:function(post, ind){
		console.log('display blog posts:   ',post)
		return (
			<div key={ind} className='blogWrapper' i={ind} onClick={this._showBlogPost}>
				<span className='title'>Title: {post.get('title')}</span><br/><br/>
				<span className='blog'>Blog: {post.get('blog')}</span><br/><br/><br/>
			</div>
			)
	},

	componentWillMount:function(){
		var component = this
			console.log('befoe sync ', component)
		this.props.bloglist.on('sync', function(){
			component.setstate({
				blogList:component.props.blogList
			})
		})
	},

	render:function(){
		var component = this
		console.log(component)
		return (
			<div className='blogList'>
			<Header/>
			<NavBar/>
			<h2> Blog List Here</h2>
			<div>
				{this.state.blogList.models.map(component._displayBlogPosts)}
			</div>

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

		rtr.navigate('#bloglist',{trigger:true})
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
		rtr = this
		console.log(rtr.authenticatedUser)
		if(!rtr.authenticatedUser){
			this.navigate('splash',{trigger:true})
			return
		}

		var bloglist = new BlogList()
		
		DOM.render(<Bloglist bloglist={bloglist}/>, document.querySelector('.container'))
	},

	handleCreateBlog:function(){
			DOM.render(<Createblog />, document.querySelector('.container'))
	},

	handleSplashPage:function(){
			DOM.render(<SplashPage/>, document.querySelector('.container'))
	},

	initialize:function(){
		var rtr = this
		rtr.authenticatedUser = null
		fbRef.onAuth(function(authData){
			if(authData){
				rtr.authenticatedUser = authData
			} else {
				rtr.authenticatedUser = null

			}
		})
		BackboneFire.history.start()
	}
})

var rtr = new BlogRouter()