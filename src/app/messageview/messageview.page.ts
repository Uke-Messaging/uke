import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Conversation } from '../model/conversation.model';
import { Message } from '../model/message.model';

@Component({
  selector: 'app-messageview',
  templateUrl: './messageview.page.html',
  styleUrls: ['./messageview.page.scss'],
})
export class MessageviewPage implements OnInit {


  recipient: string = "";
  sender: string = "";
  messages: Message[] = [];

  constructor(private route: ActivatedRoute, private router: Router) { 
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        const convo: Conversation = this.router.getCurrentNavigation().extras.state.convo;
        this.recipient = convo.recipient.uniqueId;
        this.sender = convo.sender.uniqueId;
        this.messages = convo.messages;

        console.log(this.recipient)
        console.log(this.sender)
        console.log(this.messages)


      }
    });

  }

  ngOnInit() {
  }

}
