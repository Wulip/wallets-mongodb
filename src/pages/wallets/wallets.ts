import { Component, OnInit } from '@angular/core';

import { AlertController } from 'ionic-angular';
import { NavController } from 'ionic-angular';

import { CashFlowsPage } from '../cash-flows/cash-flows'

import { Wallet } from '../../models/wallet/wallet';

import { WalletService } from '../../services/wallet/wallet.service'
import {CashFlowService} from "../../services/cash-flow/cash-flow.service";
import {CashFlow} from "../../models/cash-flow/cash-flow";

@Component({
    selector: 'page-wallets',
    templateUrl: './wallets.html'
})

export class WalletsPage implements OnInit {

    public wallets:Wallet[];

    constructor(private walletService:WalletService, private cashFlowService:CashFlowService,
                public alertController:AlertController, private navController:NavController){}

    ngOnInit (){
        this.getWallets();
    }

    addWallet() {
        let prompt = this.alertController.create({
            title: 'Új pénztárca',
            message: 'Írd be az új pénztárca adatait',
            inputs: [
                {
                    name: 'name',
                    placeholder: 'Név'
                },
                {
                    name:'amount',
                    placeholder: 'Kezdő összeg',
                    type: 'number'
                }
            ],
            buttons:[
                {
                    text: 'Mégse',
                    role:'cancel'
                },
                {
                   text: 'Hozzáadás',
                   handler:wallet => {
                       this.walletService.addWallet(wallet)
                           .subscribe(wallet => {
                               this.wallets.push(wallet)
                               let cashFlow = new CashFlow();
                               cashFlow.walletId = wallet.id;
                               cashFlow.amount = wallet.amount;
                               cashFlow.text = 'Kezdő összeg';
                               cashFlow.date = new Date()
                               this.cashFlowService.addCashFlow(cashFlow)
                                   .subscribe();
                           });
                   }
                }
            ]
        });
        prompt.present();
    }

    deleteWallet(wallet:Wallet, index:number) {
        let confirm = this.alertController.create({
            title: `${wallet.name} törlése`,
            message: 'Biztos hogy törlöni akarod ezt a pénztárcát?',
            buttons:[
                {
                    'text': 'Mégse',
                    'role': 'cancel'
                },
                {
                    'text': 'Törlés',
                    'handler': () => {
                        this.walletService.deleteWallet(wallet.id)
                            .subscribe(() => this.wallets.splice(index, 1));
                    }
                }
            ]
        })
        confirm.present();
    }

    getWallets() {
        this.walletService.getWallets()
            .subscribe((wallets:Wallet[]) => this.wallets = wallets);
    }

    goToCashFlows(wallet:Wallet) {
        this.navController.push(CashFlowsPage, {wallet: wallet});
    }

    modifyWallet(wallet:Wallet) {
        let prompt = this.alertController.create({
            title: `${wallet.name} szerkestése`,
            message: 'Írd be a pénztárca új nevét',
            inputs: [
                {
                    name: 'name',
                    placeholder: 'Név',
                    value: wallet.name
                }
            ],
            buttons:[
                {
                    text: 'Mégse',
                    role: 'cancel'
                },
                {
                    text: 'Szerkesztés',
                    handler:promptWallet => {
                        let sendWallet = wallet;
                        sendWallet.name = promptWallet.name;
                        sendWallet.amount = 0;
                        this.walletService.modifyWallet(sendWallet)
                            .subscribe(responseWallet => wallet = responseWallet);
                    }
                }
            ]
        });
        prompt.present();
    }


}
