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


//base variables
var rootFbURL = 'https://bloglivesmatter.firebaseio.com/'

var fbRef = new Firebase(rootFbURL)

// Firebase Collections
var BlogList = BackboneFire.Firebase.Collection.extend({
	url: '',
	initialize:function(){
		this.url = rootFbURL + 'bloglist/' + rtr.userId + '/'
		console.log('this.url>>>>>>>>', this.url)
	}
})

var PublicBlog = BackboneFire.Firebase.Collection.extend({
	url: '',
	initialize:function(){
		this.url = rootFbURL + '/' 
	}
})


//Modules
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
			<button className="button-primary" onClick={this._ButtonAction} value={butType} key={ind}>{butType}</button>
		)
	},

	render:function(){
		var component = this
		return (
		<div>
			{['logout','createblog', 'bloglist', 'publicblog'].map(component._genButtons)}
		</div>
		)
	}
})


//Views
var SplashPage = React.createClass({

	getInitialState:function(){
		return {isExtended:false}
	},

	_authLogIn:function(authDataObject){
		fbRef.authWithPassword(authDataObject, function(err, authData){
			if (err) {
				alert('not signed in')
			} else {
				rtr.userId = authData.uid
				rtr.navigate('#bloglist',{trigger:true})

			}
		})
	},

	_handleSignUp:function(event){
		event.preventDefault()
		var component = this

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
			
				if (err) {
					alert(err.message)
				} else {
					component._authLogIn(newUser)
				}
			})
	},

	_handleLogIn:function(event){
		event.preventDefault()

		var authDataObject={
			email:event.currentTarget.username.value,
			password:event.currentTarget.password.value
		}
		console.log('authDataObject', authDataObject)

		this._authLogIn(authDataObject)
	},

	_showSignIn:function(evt){
		if (this.state.isExtended) this.setState({ isExtended:false})
		else this.setState({ isExtended:true })
	},

	render:function(){
		var elClassName = 'sign'
		if (this.state.isExtended) {elClassName = 'sign extended'}
		return(
			<div id='splashpage'>
			<Header/>
				<form onSubmit={this._handleSignUp}>
					<h3 onClick={this._showSignIn} className='signin'>Sign Up Here</h3>
					<div className={elClassName}>
						<input type='text' className="u-half-width" id='email' placeholder='john@email.com...'/><br/>
						<input type='password' id='password' placeholder='password...'/><br/><br/>
						<input type='text' className="u-half-width" id='firstName' placeholder='first name...'/><br/>
						<input type='text' className="u-half-width" id='lastName' placeholder='last name...'/><br/>
						<input className='button-primary' type='submit' placeholder='signup'/><br/>
					</div>
				</form>
				<hr/>
				<form onSubmit={this._handleLogIn}>
					<h3 className='signin'>Log in Here</h3><br/>
					<div className='log'>
						<input type='text' className="u-half-width" id='username' placeholder='Your Email'/><br/>
						<input type='password' id='password' placeholder='password'/><br/>
						<input className='button-primary' type='submit' placeholder='login'/><br/>
					</div>
				</form>
			</div>
		)
	}
})

var Bloglist = React.createClass({

	getInitialState:function(){
		return { 
			blogList:this.props.blogListColl
		}
			
	},

	_displayBlogPosts:function(post, ind){
		return (
			<SinglePost key={ind} post={post}/>
		)
	},

	componentWillMount:function(){
		var component = this

		this.props.blogListColl.on('sync', function(){
			component.setState({
				blogList:component.props.blogListColl
			})
		})
	},

	render:function(){
		var component = this
		return (
			<div className='blogList'>
			<Header/>
			<NavBar/>
			<h2> Previous Blogs</h2>
			<div>
				{this.state.blogList.models.map(component._displayBlogPosts)}
			</div>
			</div>
		)
	}
})

var SinglePost = React.createClass({
	
	getInitialState:function(){
		return { isExtended:false }
	},
		

	_showBlogPost:function(evt){
		if (this.state.isExtended) this.setState({ isExtended:false})
		else  this.setState({ isExtended:true}) 

	},


	render: function(){
	
		var wholeDate = new Date()
		var month = wholeDate.getMonth() + 1
		var day = wholeDate.getDate()
		var year = wholeDate.getFullYear()
		var newDate = day+'/'+month+'/'+year
		console.log('newDate>>>>>>',newDate)
		console.log('is extended?? >>>>>>>>>>>', this.state.isExtended)
		
		var elClassName = 'blogWrapper'
		if (this.state.isExtended) { elClassName='blogWrapper extended'}
		
		return (
			<div className={elClassName} onClick={this._showBlogPost} data-postid={this.props.post.get('id')}>
				<span className='title'>Title: {this.props.post.get('title')}</span>
				<span className='date'>Date: {newDate}</span><br/><br/>
				<span className='blog'>Blog: {this.props.post.get('blog')}</span><br/><br/><br/>
			</div>
			)
	}
})

var Createblog = React.createClass({
	_saveblog:function(evt){
		evt.preventDefault()
 
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
					<textarea  id='blog' placeholder='blog away...'/><br/><br/>
					<input className='button-primary' type='submit'/>
				</form>
			</div>
		)
	}
})

var PublicBlog = React.createClass({

	componenetWillMount:function(){
		var component = this

		this.props.publicListColl.on('sync', function(){
			component.setState({
				publicListColl:component.props.publicListColl
			})
		})
	},

	render:function(){
		var component = this

		console.log(component.props.publicListColl)
		return (
			<div>
			<Header/>
			<NavBar/>
				<h3>Coming Soon</h3>
			</div>
		)

	}
})
//Router
var BlogRouter =  BackboneFire.Router.extend({
	routes: {
		'bloglist':'handleBlogList',
		'createblog':'handleCreateBlog',
		'logout': 'handleLogOut',
		'publicblog':'handlePublicBlog',
		'*splash':'handleSplashPage'
	},

	handlePublicBlog:function(){
		var publiclistColl = new PublicBlog()
		console.log('publiclistColl>>>>>', publiclistColl)

		DOM.render(<PublicBlog publiclistColl={publiclistColl} />, document.querySelector('.container'))
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

		var blogListColl = new BlogList()
		var publiclistColl = new PublicBlog()
		
		DOM.render(<Bloglist blogListColl={blogListColl} />, document.querySelector('.container'))
	},

	handleCreateBlog:function(){
		rtr = this
		console.log(rtr.authenticatedUser)
		if(!rtr.authenticatedUser){
			this.navigate('splash',{trigger:true})
			return
		}

		var blogListColl = new BlogList()
		var publiclistColl = new PublicBlog()

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