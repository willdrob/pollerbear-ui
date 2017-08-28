import { Component, OnInit, Directive, Inject } 		from '@angular/core';
import { Router, ActivatedRoute, Params }   from '@angular/router';
import { AngularFire, FirebaseObjectObservable, FirebaseApp } from 'angularfire2';
import 'rxjs/add/operator/take'
import { Subscription } from 'rxjs';
import * as firebase from 'firebase';
import 'chart.js';

import { Poll } 		from '../models/poll.model';
import { Option } 		from '../models/option.model';
import { PollVotes } 	from '../models/poll-votes.model';
import { OptionVotes } 	from '../models/option-votes.model';

@Component({
	moduleId: module.id,
	templateUrl: 'results.template.html'
})

export class ResultsComponent implements OnInit {
	poll = new Poll();
	loading = true;
	invalid = false;
	chartType: string;
	chartLabels = new Array<string>();
	chartData = new Array<any>(); 
	chartColors: Array<any> = [{}];
	chartLegend = false;
	chartOptions: any = {
    	responsive: true,
    	maintainAspectRatio: false,
        scales:
        {
            xAxes: [{
                gridLines: {
                    drawOnChartArea: false,
		            color: "#fff",
                }, 
                ticks: {
                    display: false
                }
            }],
            yAxes: [{
                ticks: {
                    min: 0,
                    fontColor: "#fff"                    
                },
                gridLines: {
                    drawOnChartArea: false,
		            color: "#fff"
                }
            }],
        },
  	};
	colors = ['#7293CB', '#E1974C', '#84BA5B', '#D35E60', '#808585', '#9067A7', '#AB6857', '#CCC210'];	

	constructor(
	  private af: AngularFire,
	  private route: ActivatedRoute,
	  private router: Router,
	  @Inject(FirebaseApp) private firebaseApp: firebase.app.App
	) {}

	ngOnInit(): void {
		this.route.params.subscribe((params: Params) => this.urlChange(params));
	}

	urlChange(params: Params): void {
		this.af.database.object(`/polls/${params['url']}`).take(1).subscribe((poll: Poll) => this.loadPoll(poll));
	}

	loadPoll(poll: Poll): void {
		if (!poll.$exists()) {
			this.loading = false;
			this.invalid = true;
			return;
		}		
		this.poll = poll;
		this.af.database.object(`/poll-votes/${this.poll.$key}`).subscribe((pollVotes: PollVotes) => this.loadPollVotes(pollVotes));
	}

	loadPollVotes(pollVotes: PollVotes): void {
		this.poll.votes = pollVotes.votes;
		var maxPoints = 0;
		var totalPoints = 0;
		for (let option of this.poll.options) {
			for (let optionVotes of pollVotes.options) {
				if(optionVotes.id === option.id) {
					option.rankPoints = optionVotes.rankPoints;
					option.majorityPoints = optionVotes.majorityPoints;
					break;
				}
			}
			if (this.poll.type === 1) {
				option.points = option.rankPoints;
			} else {
				option.points = option.majorityPoints;
			}
			if (option.points > maxPoints) {
				maxPoints = option.points;
			}
			totalPoints += option.points;
		}
		for (var option of this.poll.options) {
			if (option.points === maxPoints) {
				option.winner = true;
			}
			option.percentVotes = option.points/totalPoints*100;
		}
		this.poll.options.sort((a: Option, b: Option) => {
			return b.points - a.points ||  a.name.localeCompare(b.name);
		});		
		this.loading = false;
		this.loadChart();
	}

	loadChart(): void {
		var newLabels = new Array<string>();
		var newData = new Array<any>();
		if (this.poll.type === 1) {
			this.chartType = 'bar';
			this.chartOptions.scales.xAxes[0].display = true;
			this.chartOptions.scales.yAxes[0].display = true;
		} else {
			this.chartType = 'pie';
			this.chartOptions.scales.xAxes[0].display = false;
			this.chartOptions.scales.yAxes[0].display = false;
		}
		newData.push({
			data: new Array<number>(),
			backgroundColor: new Array<string>(),
			hoverBackgroundColor: new Array<string>()
		});
		var colorCounter = 0;
		for (var option of this.poll.options) {
			newLabels.push(option.name);
			newData[0].data.push(option.points);
			newData[0].backgroundColor.push(this.colors[colorCounter]);
			newData[0].hoverBackgroundColor.push(this.colors[colorCounter]);
			colorCounter = colorCounter < this.colors.length ? colorCounter+1 : 0;
		}			
		this.chartLabels = newLabels;
		this.chartData = newData;
	}

}