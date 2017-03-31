<template>
	<div>
		<div v-if="testable === true">
			<div v-if="busy">
				Loading...
			</div>
			<div v-if="error" class="alert error">
				{{ error }}
			</div>
			<div v-if="message" class="alert message">
				{{ message }}
			</div>
			<ul class="states">
				<li v-for="state in states">
					{{ state.name }}
					<span class="time pull-right" v-text="ago(state.time.date)"></span>
					<div class="text-right">
						<a href :disabled="busy" @click.prevent="restore(state.name)">
							Restore
						</a>
					</div>
				</li>	
			</ul>	
			<div>
				<form @submit.prevent="saveState">
					<input :disabled="busy" v-model="stateName" placeholder="State Name"><button>Save State</button>
					<label>
						<input type="checkbox" v-model="force">
						Force
					</label>
				</form>
			</div>
		</div>		
		<div v-else>
			<p v-if="!busy">This application is not testable</p>
		</div>
	</div>
</template>
<style>
	.alert {
		padding: 8px;
		border: 1px solid #333; 
	}
	.alert.message {
		color: white;
		background-color: #B1BDDE;
		border-color: #A9BCEF;	
	}
	.alert.error {
		color: white;
		background-color: #D68065;
		border-color: #A63634;	
	}

	.text-right{
		text-align: right;
	}
	.pull-right{
		float: right;
	}
	.states {
		list-style-type: none;
		padding: 0;
	}	
	.states li {
		border-bottom: 1px solid #CCC;
	    padding-bottom: 4px;
	    margin-bottom: 4px;
	}
	.time {
		color: #666;
	}
</style>
<script>
	import axios from 'axios';

	import moment from 'moment';

	export default {
		data(){
			return {
				baseUrl: '/tests',
				busy: true,
				testable: false,
				states: [],
				stateName: '',
				origin: '',
				error: '',
				message: '',
				force: false
			}
		},
		methods: {
			ago(date){
				return moment.utc(date).fromNow();
			},
			method(name) {
				return `${this.origin}${this.baseUrl}/${name}`;	
			},
			restore(state) {
				this.busy = true;
				this.message = this.error = '';
				axios.put(this.method('db/restore'), {state})
					.then(() => {
						this.message = 'Restored';
						this.busy = false;
					}, res => {
						this.error = res.response.data.message;
						this.busy = false;
					})
			},
			saveState() {
				this.busy = true;
				this.message = this.error = '';
				axios.put(this.method('db'), {force: this.force || null, state: this.stateName})
					.then(() => {
						this.message = 'Saved';
						this.stateName = '';
						this.loadStates();
					}, res => {
						this.error = res.response.data.message;
						this.busy = false;
					})

			},
			loadStates() {

				chrome.tabs.query({active: true, currentWindow: true}, t => {
					var parser = document.createElement('a');
					parser.href = t[0].url;

					this.origin = parser.origin;
					let url = this.method('db');

					axios.get(url)
						.then(res => {
							this.states = res.data;
							this.testable = true;
							this.busy = false;
						}, (res) => {
							console.log(res);
							this.testable = false;
							this.busy = false;
						})
				
				})
			}
		},

		mounted() {
			this.loadStates();
		}
	}
</script>