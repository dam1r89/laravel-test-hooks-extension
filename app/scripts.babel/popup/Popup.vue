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
			<a href @click.prevent="tab = 'states'">States</a>
			<a href @click.prevent="tab = 'dates'">Dates</a>
			<div v-if="tab == 'states'">
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
			<div v-if="tab == 'dates'">
				<p>
					Test date <span v-if="!date" v-text="date">is not set.</span>
				</p>
				<form @submit.prevent="setDate(date)">
					<input v-model="date" type="datetime-local">
					<button>Set Date</button>
				</form>
				<button type="button" @click="setDate(null)">Clear Test Date</button>
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
				tab: 'states',
				origin: '',
				baseUrl: '/test-hooks',
				busy: true,
				testable: false,
				states: [],
				stateName: '',
				force: false,
				error: '',
				message: '',
				date: '',
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
			setDate(date) {
				this.busy = true;
				this.message = this.error = '';
				axios.put(this.method('date'), {date})
					.then(() => {
						this.message = 'Saved, refresh page!';
						this.stateName = '';
						this.loadStates();
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
							this.states = res.data.states;
							this.date = res.data.date && moment(res.data.date.date).format('Y-MM-DDTHH:mm');
							this.testable = true;
							this.busy = false;
							axios.defaults.headers.common['X-CSRF-TOKEN'] =  res.data.csrfToken;
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