var Languages = module.exports = {
		logoman: '<div class="logoman"><div class="dotdot flip">.</div><div>i</div><div class="dotdot flip">.</div></div>',
		ui: {
			showpassphrase: 'Show ******** Fields',
			hidepassphrase: 'Hide Passphrase Fields',
		},
		modals: {
			encrypt: {
				notlocked: {
					text: '<p style="font-weight:bold;"> Your wallet is not secure.  </p><p>Anyone with access to a copy of <kbd>wallet.dat</kbd> can send coin without using a passphrase.</p><p>You should back up your wallet and encrypt now</p>',
				},
				locked: {
					text: '<p style="font-weight:bold;"> Your wallet is unlocked and not secure for <span class="locktimer"></span> seconds.  </p><p>Anyone with access to your wallet can send coin without using a passphrase.</p>',
				},
				buttons: {
					backup: 'Backup Wallet',
					encrypt: 'Continue to Encrypt',
				},
			},
		},
		link: {
			domain: 'snowcoins.link',
			sharekey: {
				text: 'Share Key',
			},
			sendkey: {
				text: 'Send Key',
			},
			ddns: {
				text: 'Dynamic DNS',
			},
			linkaccount: {
				text: '.link shortcuts & Dynamic DNS',
				ddns: 'Dynamic DDNS ',
				link: '.link local api for shortcuts',
			},
			messages: {
				success: {
					setsharekey: 'Share key set successfully.',
					setsendkey: 'Send key set successfully.'
				},
				error: {
					
				}
			},
			title: {
				text: 'Set up your .link account',
				info: 'A  <a href="https://inquisive.link/snowcat" target="_blank">.link account</a> gives you shortcut options.  When you link this instance of snowcoins you get a dynamic DNS entry that points to your main IP and a shortcut on the inquisive.link site. You can optionally use your shortcut to easily share addresses to receive coin and other information. ',
			},
			th: {
				machine: {
					test: 'machine',
				},
				ddns: {
					test: 'dynamic DNS',
				},
				port: {
					test: 'Port',
				},
				ip: {
					test: 'IP',
				},
				last: {
					test: 'Last Updated',
				},
				remove: {
					test: 'Remove',
				},
			},
			access: {
				nosharekey: {
					text: 'You do not have a .link account set up. <br> You can create a new account at <a href="https://inquisive.link/snowcat" target="_blank">inquisive.link</a>',
				},
				addsharekey: {
					text: 'Set your share key',
					loading: 'Setting share key...',
				},
				addsendkey: {
					text: 'Set your send key',
					loading: 'Setting send key...',
					info: '<p>The sendKey is used to sign data sent to snowcoins.link. <br />Do <b>NOT</b> share this key. </p><p> There is only 1 valid sendKey per .link account.  If you lose your sendKey you must request a new one and replace it on all accounts using .link. </p> You can request a new sendKey at <a href="https://inquisive.link/snowcat" target="_blank">inquisive.link</a>.',
				},
				setsendkey: {
					text: '<p><b>*********</b><br />You have set a sendKey.  Since this key is secret we will never display it.  You can only reset it.</p>',
					absent: 'You have not set a sendKey.  To use the .link service you need a shareKey and a sendKey.',
				}, 
				addddns: {
					text: 'valid hostname with 6 or more characters',
					ddnsInfo: '<p>Assign a machine name to get a dynamic DNS entry that points to your IP address.  You will most likely also have to add a NAT entry on your router that points to the correct machine and port to use snowcoins remotely.</p> ',
					trackerInfo: 'When you add a valid entry the tracker will keep your ip up to date as long as snowcoins is running.',
					linkInfo: ' <p> If you want to use shortcuts and share accounts without giving your DDNS address out,  .link will need a local api server to communicate. Communication from .link servers are signed with your sendKey. By setting "No", .link will not have a local api port number for you and communication will be off. You can continue to use Dynamic DNS while .link is off.  </p> ',
					linkAsk: 'Allow a remote .link server to communicate with a local api server?',
					addbutton: 'Manage dynamic DNS',
					button: 'Set Dynamic DNS & .link',
					buttonadding: 'Setting DDNS & .link...',
					absent: 'You have not set a machine name.  Sending a machine name to snowcoins.link will add a dynamic DNS entry pointing to your public IP.',
					port: 'port',
					allow: ' <p>*NOTE* - this affects all users on this server.  If you turn it off it is off for all users. <br />Setting to yes will start a server in the background for communication. <br />You will need to open port {port} on your router and/or firewall. </p>',
				},
			},
		},
		wallet: {
			tx: {
				pager: {
					next: 'Next {num}',
					prev: 'Prev {num}',
				},
			},
			remove: {
				removed: {
					success: {
						text: 'Wallet {name} successfully deleted.'
					},
					fail: {
						text: 'Error removing wallet {name}'
					},
					wrong: {
						text: 'Name does not match'
					},
				},
				confirm: {
					text: "Last button, I promise. \r\nEnter the wallet name ({name}) and press OK to permanently delete "
				},
				btn: {
					remove: 'Remove Wallet Now',
					request: 'Request Permission First',
					cancel: "Do Not Remove"
				},
				title: {
					text: 'Permanently Remove '
				},
				goodinfo: {
					text: '<p><span>You have requested to delete {name}</span></p>You can not undo this action.  Are you sure you want to continue?'
				},
				badinfo: {
					text: 'You requested to delete {name}, but you skipped an important step. <br /> Right now you do not have permission to delete this wallet.  <br />Return to the wallet list and click remove from there.'
				},
			},
			
		},
		accounts: {
			address: {
				singular: 'address',
				plural: 'addresses',
				title: '',
				short: {
					singular: 'addr',
					plural: 'adrs',
				},
				moreinfo: {
					head: {
						text:'.link ',
					},
					expires: {
						text:'Expires ',
					},
					nolink : {
						linkoff: '&nbsp; .link server is OFF ',
						localon: '  &nbsp; Local  <a href="{link}" target="_blank">{linktext}</a> page only. ',
						turnon: 'Turn On',
					},
					shortcut: {
						placeholder:'shortcut',
						text:'The name is what will be used to access the shortcut.',
					},
					button: {
						submit: 'Create Shortcut',
						update: 'Update Shortcut',
						submitting: 'Creating Shortcut...',
						updating: 'Updating Shortcut...',
					},
					type: {
						text:'This shortcut can be used to:',
						option: {
							one: 'Share address only',
							two: 'Share address and payment request',
							three: 'Payment request only'
						},
						info: 'Payment requests should be initiated by you.  When doing so you will set a unique pinop and key phrase that is verifiable for a specific time period.  The request is then sent to you after verified by .link.  The request will include a payment address and info from the requesting service. You will use the pinop you selected to unlock the address.',
					},
					lock: {
						option: {
							no: 'No',
							yes: 'Yes',
						},
						lockinput: 'Lock this shortcut?',
						lock: 'When locked, the end user must enter the pinop to view the address.  You will be responsible for relaying the pinop to end users. The key phrase is still in clear view.'
					},
					pin: {
						text:'pinop',
						placeholder: 'lock pin or phrase'
					},
					pinphrase: {
						text:'message',
						placeholder: 'short message to display to user'
					},
					sign: {
						text:'Enter a pinop (personal identification number or phrase). This will be encrypted and never seen by anyone else.  You can lock the shortcut to encrypt the address.',
					},
					signphrase: {
						text:'The key phrase and address is hashed with the pinop and a secret key. To verify, .link checks if a hash of your information matches the hash we have stored and if the shortcut is still valid.',
					},
				},
			},
			tx: {
				text: 'TX',
				title: '',
			},
			new: {
				account: 'New Account',
				address: 'New Address',
				short: 'NEW',
				createAddress: 'Create a new address',
				promptAccount: 'Enter a name and click OK to create a new account.\n\nName ',
				createAddressBtn: 'Create New Address Now',
			},
		},	
		settings: {
			messages: {
				success: {
					changeLanguage: 'Language switched to EN-US.'
				},
				error: {
					
				}
			},
			menu: {
				rates: {
					text: 'Currency Rates',
					title: 'Manage currency rate grabs',
				},
				language: {
					text: 'Language',
					title: 'Choose default language',
				},
				autobot: {
					text: '.link Shortcuts',
					title: 'Shortcuts and Sharing',
				},
			},
			language: {
				choose: {
					text: 'Choose default language'
				},
				switch: {
					text: 'Switch to language: '
				},
			},
			rates: {
				
				title: {
					text: 'currency rates', 
					title: '',
				},
				button: {
					add: {
						text:'Schedule Rate Grabs ',
						title: '',
					},
				},
				schedule: {
					label: {
						when: 'Update my conversion rates every...',
						which: 'Conversion Api'
					}
				},
				table: {
					th: {
						coin: {
							text:'coin',
							title: '',
						},
						usd: {
							text:'USD',
							title: '',
						},
						eur: {
							text:'EUR',
							title: '',
						},
						btc: {
							text:'btc',
							title: '',
						},
						ltc: {
							text:'ltc',
							title: '',
						},
						doge: {
							text:'doge',
							title: '',
						},
						time: {
							text:'Updated',
							title: '',
						},
					},
				},
				
			},
		},
		receive: {
			tabs: {
				dynamic: {
					text: 'Dynamic',
					title: 'Working with you',
				},
				static: {
					text: 'Shortcuts',
					title: 'Create shortcuts',
				},
				trackers: {
					text: 'Trackers',
					title: 'Working for you',
				},
				keys: {
					text: 'API Keys',
					title: 'Working with you',
				},	
			},
			dynamic: {
				title: {
					text: 'Working with you',
					title: 'Working with you',
				},
				button: {
					add: {
						text:'Add new Dynamic Receiver',
						title: '',
					},
				},
				table: {
					th: {
						coin: {
							text:'coin',
							title: '',
						},
						receiver: {
							text:'receiver',
							title: '',
						},
						wallet: {
							text:'wallet',
							title: '',
						},
						account: {
							text:'account',
							title: '',
						},
						address: {
							text:'address',
							title: '',
						},
						cfms: {
							text:'cfms',
							title: '',
						},
					},
				},
				
			},
			static: {
				title: {
					text: 'Share shortcuts',
					title: 'Working for you',
				},
				button: {
					add: {
						text:'Create a shortcut',
						title: '',
					},
				},
				table: {
					th: {
						name: {
							text:'name',
							title: '',
						},
						coin: {
							text:'coin/type',
							title: '',
						},
						findme: {
							text:'shortcut',
							title: '',
						},
						
						account: {
							text:'pinop/keyphrase',
							title: '',
						},
						address: {
							text:'address',
							title: '',
						},
						expires: {
							text:'expires',
							title: '',
						},
					},
				},
				
			},
			keys: {
				title: {
					text: 'Manage access to D3C / D2C',
					title: '',
				},
				button: {
					add: {
						text: 'Grant Access to API',
						title: 'Give access to the public API and the D2C & D3C'
					},
					client: {
						text:'Add new D2C Client',
						title: '',
					},
					master: {
						text:'Add new D3C Master',
						title: '',
					},
				},
				table: {
					th: {
						name: {
							text:'name',
							title: '',
						},
						type: {
							text:'type',
							title: '',
						},
						key: {
							text:'key',
							title: '',
						},
						ip: {
							text:'ip',
							title: '',
						},
						manages: {
							text:'manages',
							title: '',
						}
					},
				},
				form: {
					controls: {
						master:'Masters (1-5) control the D3C',
						client: 'Clients (6-10) use the D2C',
						select: {
							a: '1 - owner master',
							b: '2 - admin master',
							c: '3 - master',
							d: '4 - learning master',
							e: '5 - barely master',
							f: '6 - special client',
							g: '7 - reserved client admin',
							h: '8 - client',
							i: '9 - learning client',
							j:'10 - guest'
						}
					},
					ip: {
						select: {
							a: 'my local ip',
							b: 'my local block',
							c: 'my external ip',
							d: 'my external block',
							e: 'everyone',
							f: 'custom'
						}
					},
					range: {
						text:'IP Range',
						title: 'Restrict client access to an IP or range of IP addresses. <br > ex: 10.0.0.1/32 - single IP<br />ex: 10.0.0.1/24 - ip block <br /> Leave blank or select anywhere for an open key without ip checks.',
					},
					auth: {
						text:'Auth Level',
						title: '',
					},
					name: {
						text:'Name',
						title: 'Grant API Access',
					},
					apikey: {
						text:'Api Key',
						title: '',
					},
					button: {
						add: 'Grant API Access',
						adding: 'Granting API Access...',
						cancel: 'Cancel',
					},
					
				},
				
			},
			trackers: {
				title: {
					text: 'Running Trackers',
					title: '',
				},
				button: {
					add: {
						text:'Add a new Tracker',
						title: '',
					},
				},
				table: {
					th: {
						name: {
							text:'name',
							title: '',
						},
						type: {
							text:'type',
							title: '',
						},
						date: {
							text:'last run',
							title: '',
						},
						interval: {
							text:'often',
							title: '',
						},
						wallet: {
							text:'wallet',
							title: '',
						},
						account: {
							text:'account',
							title: '',
						},
						address: {
							text:'address',
							title: '',
						},
						owner: {
							text:'owner',
							title: '',
						},
						
					},
				},
				
			},
			
		},
		menu : {
			inqueue: {
				name: '.link',
				title: 'snowcoins.link',
			},
			link: {
				name: '.link',
				title: 'snowcoins.link',
			},
			profile: {
				name: 'profile',
				title: 'update user settings',
			},
			selectWallet: {
				name: 'select a wallet',
			},
			menu: {
				name:'menu',
				title:'menu',
			},
			plus: {
				name:'add wallet',
				title:'',
			},
			settings: {
				name:'settings',
				title:'Digital Coin Coordinator settings',
			},
			receive: {
				name:'receive coin',
				title:'Receive coins from strangers. (friends too)',
			},
			list: {
				name:'list wallets',
				title:'',
			},
			dashboard: {
				name:'Dashboard',
				title:'Dashboard',
			},
			accounts: {
				name:'Accounts',
				title:'manage wallet accounts',
			},
			send: {
				name:'Send',
				title:'send coins',
			},
			tx: {
				name:'Transactions',
				title:'sortable transaction list',
			},
			update: {
				name:'Update',
				title:'update wallet',
			},
			remove: {
				name: 'Delete ',
				title: 'remove wallet',
			},
			help: {
				name:'Help & Info',
				title:'help and information',
			},
			left: {
				receive: {
					name:'Receive Coin',
					title:'Receive coins from strangers. (friends too)',
				},
				settings: {
					name:'Settings',
					title:'Digital Coin Coordinator settings',
				},
				wallet: {
					name:'Wallets',
					title:'Manage your wallets',
				},
			}
			
		},
		d3c : {
			searchbar: {
				findledger: 'Find by',
				findtx: 'Find by',
				
				placeholder: 'search ',
			},
			menu: {
				create: {
					name:'create',
					title:'create commands',
					links: {
						ledger: {
							name: 'Ledger',
							title: 'New Legder Entry',
						},
						item: {
							name: 'Items',
							title: 'Add an Item to a Leger or Transaction',
						},
						tx: {
							name: 'Transaction',
							title: 'New Transaction',
						},
					}
				},
				view: {
					name:'manage',
					title:'Manage',
					links: {
						ledger: {
							name: 'Ledger',
							title: 'Manage Legder Entries',
						},
						item: {
							name: 'Items',
							title: 'Manage Leger / Transaction Items',
						},
						tx: {
							name: 'Transaction',
							title: 'Manage Transactions',
						},
					}
				},
				connect: {
					name:'connect',
					title:'menu',
					links: {
						clients: {
							name: 'clients',
							title: 'Client Messenger',
						},
						customers: {
							name: 'customers',
							title: 'Connect with Customers',
						},
						employees: {
							name: 'employees',
							title: 'Employee Contacts',
						},
					}
				},
				organize: {
					name:'organize',
					title:'menu',
				},
			},
			/* end menu */
			ledgerform: {
				inputs: {
					total: {
						label: 'Total',
						title: 'total amount in numbers',
						placeholder: 'total amount in numbers',
					},
					totaloffset: {
						label: 'Total Offset',
						title: 'Total offset',
						placeholder: 'total amount in numbers',
						help: 'If you plan on accepting multiple coins for payment you should set an offset.  If you charge 55000 Ð and accept Ð, BTC and LTC for payment the conversion may leave a payment at 49990 Ð.  If you set the offset to 10 Ð the order would be considered complete.',
					},
					currency: {
						label: 'Currency',
						title: 'Currency',
					},
					clients: {
						label: 'Clients',
						title: 'Select any number of clients to send this ledger to.',
					},
					ledgerid: {
						label: 'Ledger #',
						title: 'unique # - Leave blank to generate the next id in order',
						placeholder: 'unique - empty to generate the next id in order',
					},
				
				},
				/* end inputs */
				buttons: {
					submit: {
						label: 'Add New Ledger',
						loading: 'Creating new ledger...'
					},
				},
				/* end buttons */
				
			},
			/* end ledgerform */
			txform: {
				inputs: {
					amount: {
						label: 'Amount',
						title: 'coin amount',
						placeholder: 'coin amount',
					},
					
					wallet: {
						label: 'Wallet',
						title: 'Wallet',
					},
					clients: {
						label: 'Clients',
						title: 'Select any number of clients to send this ledger to.',
					},
					ledgerid: {
						label: 'Ledger',
						title: 'Valid ledger #',
						placeholder: 'valid ledger',
					},
					confirmations: {
						label: 'Confirmations',
						title: 'Number of confirmations needed to complete a transactions',
						placeholder: 'tx complete on',
					},
					account: {
						label: 'Account',
						title: 'Select an exisitng account or add a new one',
						placeholder: 'new or existing - blank for default',
					},
					address: {
						label: 'Address',
						title: 'Select an address',
						placeholder: 'coin address',
					},
					status: {
						label: 'Status',
						title: 'Select a status',
						list: 'created, sent, confirming, complete, manual, failure',
					},
					track: {
						label: 'Track',
						title: 'Track this transaction for confirmation of funds',
						list: 'no, yes',
					},
				
				},
				/* end inputs */
				buttons: {
					submit: {
						label: 'Add New Transaction',
						loading: 'Creating new transaction...'
					},
				},
				/* end buttons */
			},
			/* end txform */
			itemform: {
				
			},
			/* end itemform */
			ledgerview: {
				
			},
			/* end ledgerview */
			txview: {
				
			},
			/* end txview */
			itemview: {
				
			},
			/* end itemview */
		}
};
/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
