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

//Put on window 'for testing in chrome dev tools'
window.jq = $

window.BBFIRE = BackboneFire
window.FB = Firebase

//base variables
var rootFbURL = 'https://bloglivesmatter.firebaseio.com/'

//creating a reference point to firebase DB 
var fbRef = new Firebase(rootFbURL)
window.fbRef = fbRef
//OBESOLTE>>>>>>>>>>
//  fbRef.onAuth (function(){
//        var userPostColl = new PostsByUserCollection( authData.uid );
//         userPostColl.fetch()
//         userPostColl.on("sync", function(){
//           console.log("all the users secrets: ", userSecretColl.models[0])
//           rtr.authenticatedUserPosts = userSecretColl.models[0]
//           window.location.hash= ''
//         })
// })
//<<<<<<<<<<<<<<<<<

let _autherizeLogin = {
	_authLogIn:function(authDataObject){
		fbRef.authWithPassword(authDataObject, function(err, authData){
			console.log('err:', err)
			console.log('authData:', authData)
			if (err) {
				alert('not signed in')
			} else {
				rtr.navigate('#bloglist', {trigger:true} )
			}
		})
	},
}

// Firebase Collections


var UserModel = BackboneFire.Firebase.Model.extend({
	url: function() {
		return `${rootFbURL}/users/${this.id}`
	},

	initialize:function(uid){
		this.id = uid
	}
})


// fbRef.child('users').child(authData.uid).on('value',function(data){console.log(data.val())})
// THIS (vanilla firebase sdk) IS THE MOST BASIC WAY OF RETRIEVING DATA FROM THE FIREBASE DATABASE.

// THE SURROUNDING BACKFIRE MODELS AND COLLECTIONS ARE THE BACKBONE-INTEGRATED METHODS OF RECEIVING THAT DATA.

var BlogListCollection = BackboneFire.Firebase.Collection.extend({
	url: '',
	initialize:function(uid){
		this.url = rootFbURL + 'users/' + uid + '/posts/'
		console.log('this.url>>>>>>>>', this.url)
	}
})

var PublicBlogCollection = BackboneFire.Firebase.Collection.extend({
	url: '',
	initialize:function(){
		this.url = rootFbURL + 'users/allPosts'
	}
})

var PostsByUserCollection = BackboneFire.Firebase.Collection.extend({
  autoSync: false,
  
  url: '',

  initialize: function(uid){
    //pass a uid to query
    var ref = new Firebase("https://bloglivesmatter.firebaseio.com/")
    if (uid) { ref = ref.orderByChild('uid').equalTo(uid) }
    this.url = ref
  }
})


//Modules & Top Level Functions
var Header = React.createClass({
	render:function(){return(<div><h3 className='header'>All Blogs Matter !</h3></div>)}
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

		
		fbRef.createUser(newUser, function(err, authData){
			console.log('err>>>>>', [err])
			console.log('authData>>>>>', authData)
			
			if (err) {
				alert(err.message)
			} 
			else {
				fbRef.child('users').child(authData.uid).set(
					{firstName:fstName, lastName:lstName, email:emailInput, posts: "" }
				)
				console.log('fbRef', fbRef)
				_autherizeLogin._authLogIn(newUser)				
			}
		})
	},

	_handleLogIn:function(event){
		event.preventDefault()

		var authDataObject={
			email:event.currentTarget.username.value,
			password:event.currentTarget.password.value
		}

		_autherizeLogin._authLogIn(authDataObject)
	},

	_showSignIn:function(evt){
		if (this.state.isExtended) this.setState({ isExtended:false})
		else this.setState({ isExtended:true })
	},

	getInitialState:function(){
		return {isExtended:false}
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
			blogList:this.props.blogListColl,
		}		
	},

	_displayBlogPosts:function(post, ind){
		if (!post.get('title')) return ''
		return (
			<SinglePost key={ind} post={post} userModel={this.props.userModel} />
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
				<h2>Personal Blogs</h2>
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
		
		var elClassName = 'blogWrapper'
		if (this.state.isExtended) { elClassName='blogWrapper extended'}
 		// {this.props.userName.get('firstName')}

 		var firstName
 		if ( this.props.userModel) {
 			firstName = this.props.userModel.get('firstName')
 		} else {
 			console.log(this.props.post)
 			firstName = this.props.post.get('firstName')
 		}

		return (
			<div className={elClassName} onClick={this._showBlogPost} data-postid={this.props.post.get('id')}>
				<span className='title'>Name:{firstName}</span><br/>
				<span className='title'>Title: {this.props.post.get('title')}</span><br/>
				<span className='date'>Date: {newDate}</span><br/>
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
			blog: evt.currentTarget.blog.value,
		}


		var blogListColl = new BlogListCollection(fbRef.getAuth().uid)

		blogListColl.create({
			title: blogObj.title,
			blog:  blogObj.blog,
		})

		var publicListColl = new PublicBlogCollection()

		publicListColl.create({
			title: blogObj.title,
			blog:  blogObj.blog,
			firstName: this.props.userModel.get('firstName'),
			lastName: this.props.userModel.get('lastName')

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

	getInitialState:function(){
		console.log('component in getinitialstate', this)
		return {
			publicList: this.props.publicListColl,
		}
	},

	_displayAllPosts:function(post, ind){
		if (!post.get('title')) return ''
		return (
			<SinglePost key={ind} post={post} userModel={false}/>
		)
	},

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

		console.log(component.state.models)
		console.log(component.props.publicListColl)
		return (
			<div>
			<Header/>
			<NavBar/>
				<div>
					{component.props.publicListColl.models.map(component._displayAllPosts)}
				</div>
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
		var publicListColl = new PublicBlogCollection()
		var queriedUserMdl = new UserModel(fbRef.getAuth().uid)

		DOM.render(<PublicBlog userModel={queriedUserMdl} publicListColl={publicListColl} />, document.querySelector('.container'))
	},

	handleLogOut:function(evt){
		fbRef.unauth()
		this.navigate('splash',{trigger:true})
	},

	handleBlogList:function(){
		console.log('handling blog list')
		rtr = this
		fbRef.authData = fbRef.getAuth()
		// UM = UserModel
		var queriedUserMdl = new UserModel(fbRef.getAuth().uid)
		var blogListColl = new BlogListCollection(fbRef.getAuth().uid)
		var publicListColl = new PublicBlogCollection()
		
		DOM.render(<Bloglist blogListColl={blogListColl} userModel={queriedUserMdl} publicListColl={publicListColl}/>, document.querySelector('.container'))
	},

	handleCreateBlog:function(){
		rtr = this
		var queriedUserMdl = new UserModel(fbRef.getAuth().uid)
		console.log('userName>>>>>>>', queriedUserMdl)

		DOM.render(<Createblog userModel={queriedUserMdl} />, document.querySelector('.container'))
	},

	handleSplashPage:function(){
			DOM.render(<SplashPage/>, document.querySelector('.container'))
	},

	initialize:function(){
		var rtr = this
		console.log('initializing')
		rtr.authenticatedUser = fbRef.getAuth()

		if (!rtr.authenticatedUser) location.hash = "splash"

		// fbRef.onAuth(function(authData){
		// 	console.log('new auth status! >>>>>', authData)

		// 	if(authData){
		// 		rtr.userId = authData.uid
		// 		rtr.authenticatedUser = authData
		// 	} else {
		// 		rtr.authenticatedUser = null
		// 	}
		// })


		rtr.on('all', function() {
			if(!fbRef.getAuth()){
				location.hash = "splash"
			}	
		})
		BackboneFire.history.start()
	}
})

var rtr = new BlogRouter()