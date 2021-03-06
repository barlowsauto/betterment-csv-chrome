var assert = require('assert');
var should = require('should');
var BettermentPdfArrayParser = require('../app/src/betterment-pdf-array-parser');

describe('Betterment PDF Parsing', function() {
	var pdfParser = new BettermentPdfArrayParser.BettermentPdfArrayParser();

	describe('Date formats', function() {
		it('should parse brokerage date formats', function() {
			var transactions = pdfParser.parse([
				["Blah Goal"],
				["Portfolio/Fund","Price","Shares","Value","Shares","Value"],
				["Feb 3 2016","Blah","Stocks / VTI","$95.56","10.472","-$1,000.68","1.387","$1.23"],
			]);

			transactions[0].date.should.eql(new Date(2016, 1, 3));
		});

		it('should parse 401(k) date formats', function() {
			var transactions = pdfParser.parse([
				["Blah Goal"],
				["Portfolio/Fund","Price","Shares","Value","Shares","Value"],
				["Nov 2nd, 2015","Blah","Stocks / MUB","$95.56","10.472","-$1,000.68","1.387","$1.23"],
				["Dec 29th, 2015","Blah","Stocks / VTI","$95.56","10.472","-$1,000.68","1.387","$1.23"],
			]);

			transactions[0].date.should.eql(new Date(2015, 10, 2));
			transactions[1].date.should.eql(new Date(2015, 11, 29));
		});
	});

	describe('negative values', function() {
		var testPdf = [
			["Traditional 401(k) Goal"],
			["Portfolio/Fund","Price","Shares","Value","Shares","Value"],
			["Feb 3 2016","1/29/2016 Payroll Contribution","Stocks / VTI","$95.56","10.472","-$1,000.68","1.387","$1.23"],
		];

		var transactions = pdfParser.parse(testPdf);

		it('should parse negative amounts correctly', function() {
			assert.equal(transactions.length, 1);
			assert.equal(transactions[0].amount, "-1000.68");
		});

		it('should return negative quantities with negative amounts', function() {
			assert.equal(transactions[0].quantity, "-10.471746");
		});
	});

	describe('wire transfer', function() {
		var wireTransferPdf = [
			[],
			["Page ","1"," of ","2"],
			["Overview"],
			["Current Balance","$1,293.82"],
			["Total invested","$1,320.15"],
			["Total earned","-$26.33"],
			["Account opened"],
			["Betterment 401(k) Savings Plan FBO Bob Bob"],
			["bob@example.com"],
			["1 Blah St"],
			["#1"],
			["Blah, CC11111"],
			["Transaction Confirmation"],
			["Betterment"],
			["Betterment Securities, Broker-Dealer"],
			["61 West 23rd Street, 5th Floor "],
			["New York, NY 10010 "],
			["888.428.9482"],
			["Traditional 401(k) Goal"],
			["Transaction Summary: Wire for 401(k) Plan Conversion"],
			["Portfolio"],
			["Prior"],
			["Balance","Change"],
			["Current"],
			["Balance"],
			["Balance"],
			["Composition"],
			["Stocks","$973.67","$1,320.15","$1,293.82","100%"],
			["Bonds","$0.00","$0.00","$0.00","0%"],
			["Account Total","$973.67","$1,320.15","$1,293.82","100%"],
			["Transaction Detail"],
			["Change","Balance"],
			["Date "],
			["1"],
			["Transaction "],
			["2"],
			["Portfolio/Fund","Price","Shares","Value","Shares","Value"],
			["Nov 17 2015"],
			["Wire for 401(k) Plan"],
			["Conversion"],
			["Stocks / VTV","$82.18","1119.272","$1,801.75","121.384","$1,975.30"],
			["Stocks / VTI","$105.42","912.934","$1,797.11","94.571","$1,969.63"],
			["Stocks / VOE","$87.41","315.885","$1,136.72","36.517","$1,191.98"],
			["Stocks / VBR","$101.98","126.909","$1,744.21","27.380","$1,792.23"],
			["Stocks / VEA","$37.50","6104.487","$11,668.28","615.176","$11,069.10"],
			["Stocks / VWO","$34.39","2018.551","$1,172.08","212.142","$1,295.58"],
			["1"],
			[" Unless otherwise noted, the settlement date is three market days after the transaction date. "],
			[" Betterment Securities acted as an agent for you and bought or sold securities on your behalf. "],
			["2"],
			["Note: If this transaction included a sale of non-covered securities (purchased outside of Betterment and transferred into your account with incomplete lot"],
			["information), the purchase date with respect to those lots may be an estimate."]
		]

		var transactions = pdfParser.parse(wireTransferPdf);

		it('should return the right transactions', function () {
			var expectedTransactions = [
				// These quantity numbers don't match the above PDF since we're calculating them from
				// price and amount.
				{ticker: 'VTV', price: '82.18', amount: '1801.75', quantity: '21.924434'},
				{ticker: 'VTI', price: '105.42', amount: '1797.11', quantity: '17.047145'},
				{ticker: 'VOE', price: '87.41', amount: '1136.72', quantity: '13.004462'},
				{ticker: 'VBR', price: '101.98', amount: '1744.21', quantity: '17.103452'},
				{ticker: 'VEA', price: '37.50', amount: '11668.28', quantity: '311.154133'},
				{ticker: 'VWO', price: '34.39', amount: '1172.08', quantity: '34.082001'},
			];
			expectedTransactions.forEach(function(tran) {
				tran.account = 'Traditional 401(k) Goal';
				tran.description = 'Wire for 401(k) Plan Conversion';
				tran.date = new Date('Nov 17 2015');
			});
			assert.deepEqual(transactions, expectedTransactions);
		});

	});

	describe('401k confirmation', function() {
		var four01kPdf = [
			[],
			["Page ","1"," of ","2"],
			["Overview"],
			["Current Balance","$1,153.76"],
			["Total invested","$1,697.62"],
			["Total earned","-$1,543.86"],
			["Account opened"],
			["Betterment 401(k) Savings Plan FBO Bob Bob"],
			["bob@example.com"],
			["1 Blah St"],
			["#1"],
			["Blah, CC11111"],
			["Transaction Confirmation"],
			["Betterment"],
			["Betterment Securities, Broker-Dealer"],
			["61 West 23rd Street, 5th Floor "],
			["New York, NY 10010 "],
			["888.428.9482"],
			["Traditional 401(k) Goal"],
			["Transaction Summary: 1/29/2016 Payroll Contribution"],
			["Portfolio"],
			["Prior"],
			["Balance","Change"],
			["Current"],
			["Balance"],
			["Balance"],
			["Composition"],
			["Stocks","$1,215.02","$1,938.74","$1,153.76","100%"],
			["Bonds","$0.00","$0.00","$0.00","0%"],
			["Account Total","$1,215.02","$1,938.74","$1,153.76","100%"],
			["Transaction Detail"],
			["Change","Balance"],
			["Date "],
			["1"],
			["Transaction "],
			["2"],
			["Portfolio/Fund","Price","Shares","Value","Shares","Value"],
			["Feb 3 2016","1/29/2016 Payroll Contribution","Stocks / VTI","$95.56","10.472","$1,000.68","113.387","$1,835.23"],
			["Stocks / VTV","$75.25","12.710","$956.45","1.960","$1,832.95"],
			["Stocks / VOE","$77.84","3.918","$305.00","1.588","$1,470.72"],
			["Stocks / VBR","$89.55","2.838","$254.12","1.884","$1,034.27"],
			["Stocks / VEA","$33.59","56.773","$1,907.01","1.773","$1,050.50"],
			["Stocks / VWO","$29.64","17.391","$515.48","1.547","$1,930.09"],
			["1"],
			[" Unless otherwise noted, the settlement date is three market days after the transaction date. "],
		];

		var transactions = pdfParser.parse(four01kPdf);

		it('should return the right transactions', function () {
			var expectedTransactions = [
				{ticker: 'VTI', price: '95.56', amount: '1000.68', quantity: '10.471746'},
				{ticker: 'VTV', price: '75.25', amount: '956.45', quantity: '12.710299'},
				{ticker: 'VOE', price: '77.84', amount: '305.00', quantity: '3.918294'},
				{ticker: 'VBR', price: '89.55', amount: '254.12', quantity: '2.837744'},
				{ticker: 'VEA', price: '33.59', amount: '1907.01', quantity: '56.773147'},
				{ticker: 'VWO', price: '29.64', amount: '515.48', quantity: '17.391363'},
			];
			expectedTransactions.forEach(function(tran) {
				tran.account = 'Traditional 401(k) Goal';
				tran.description = '1/29/2016 Payroll Contribution';
				tran.date = new Date('Feb 3 2016');
			});
			assert.deepEqual(transactions, expectedTransactions);
		});

	});

	describe('transaction confirmation', function () {
		var contributionPdf = [
			[],
			["Page ","1"," of ","2"],
			["Overview"],
			["Current Balance","$11,196.06"],
			["Total invested","$21,300.00"],
			["Total earned","-$3,103.94"],
			["Account opened"],
			["Bob Bob"],
			["bob@example.com"],
			["1 Blah St."],
			["apt. 1"],
			["Blah, NY11111"],
			["Transaction Confirmation"],
			["Betterment"],
			["Betterment Securities, Broker-Dealer"],
			["61 West 23rd Street, 5th Floor "],
			["New York, NY 10010 "],
			["888.428.9482"],
			["Build Wealth Goal"],
			["Transaction Summary: Automatic Deposit"],
			["Portfolio"],
			["Prior"],
			["Balance","Change"],
			["Current"],
			["Balance"],
			["Balance"],
			["Composition"],
			["Stocks","$989.70","$87.02","$1,076.72","90%"],
			["Bonds","$106.36","$12.98","$119.34","10%"],
			["Account Total","$1,096.06","$100.00","$1,196.06","100%"],
			["Transaction Detail"],
			["Change","Balance"],
			["Date "],
			["1"],
			["Transaction "],
			["2"],
			["Portfolio/Fund","Price","Shares","Value","Shares","Value"],
			["Feb 19 2016","Automatic Deposit","Stocks / VEA","$33.56","1.252","$42.02","13.350","$448.03"],
			["Stocks / VTI","$96.96","0.166","$16.11","1.995","$193.42"],
			["Stocks / VTV","$77.10","0.193","$14.86","2.507","$193.33"],
			["Stocks / VOE","$79.37","0.056","$4.48","0.780","$61.94"],
			["Stocks / VBR","$91.18","0.041","$3.71","0.596","$54.30"],
			["Stocks / VWO","$30.65","0.191","$5.84","4.101","$125.70"],
			["Bonds / MUB","$111.71","0.065","$7.29","0.587","$65.52"],
			["Bonds / LQD","$113.87","0.007","$0.85","0.059","$6.68"],
			["Bonds / BNDX","$53.85","0.055","$2.96","0.527","$28.40"],
			["Bonds / VWOB","$74.06","0.025","$1.88","0.253","$18.74"],
			["1"],
			[" Unless otherwise noted, the settlement date is three market days after the transaction date. "],
			[" Betterment Securities acted as an agent for you and bought or sold securities on your behalf. "],
			["2"],
			["Note: If this transaction included a sale of non-covered securities (purchased outside of Betterment and transferred into your account with incomplete lot"],
			["information), the purchase date with respect to those lots may be an estimate."],
			["Please review this document carefully. If details of any transaction are incorrect, you must immediately notify Betterment Securities at"],
			["support@bettermentsecurities.com. Failure to make such notification within three (3) days of notification of this document constitutes your acceptance of the"],
			["transactions."],
			["Please take the opportunity to review the settings and restrictions, if any, on your account. This could include your portfolio allocation settings or your tax loss"],
			["harvesting settings (which you may want to review if you expect to be subject to a substantially lower tax rate) among others. Please contact"],
			["support@betterment.com, your investment adviser, if you wish to impose any reasonable restrictions on the management of your account or reasonably modify"],
			["existing restrictions."],
			["Please contact support@betterment.com, your investment adviser, if you would like to speak with someone knowledgeable about the account."],
			["CUSTODY OF ASSETS: Betterment Securities is the custodian of assets in your Betterment Securities account."],
			["FUNDS: \"Stocks\" is an aggregate summary of all securities listed within the Stock Portfolio. \"Bonds\" is an aggregate summary of all securities listed within the"],
			["Bond Portfolio. The Stocks and Bonds summaries are presented for convenience only. Actual securities holdings in the Stocks or Bonds Portfolios are listed"],
			["distinctly by name."],
			["MARKETS: Securities are often traded on multiple markets and we will exercise discretion as to the market or markets in which your order is executed."],
			["AGGREGATION: Your orders with Betterment Securities may be aggregated with the orders of other clients for purposes of execution. If orders are aggregated,"],
			["each client receives the average price of the aggregate group order."],
			["TRANSACTION TYPES: A \"Deposit\" is a purchase of securities made on account of an order that was generated by new money being transferred into your"],
			["account. A \"Withdrawal\" is a sale of securities made on account of an order that was generated by a new withdrawal from your account. \"Dividend\" is a purchase"],
			["of securities made according to an order resulting from dividends that accrue to your account. \"Allocation\" is a purchase or sale of securities made on account of a"],
			["change to your account Allocation. \"Rebalance\" is a purchase or sale of securities made according to an order that was generated by the rebalancing of your"],
			["account assets. \"Advisory Fee\" is a sale of securities liquidated to fund the payment of advisory fees to Betterment. If you are on the Betterment Institutional"],
			["platform and have a separate investment advisor, the \"Advisory Fee\" is a sale of securities liquidated to fund the payment of advisory fees to Betterment and that"],
			["investment advisor. \"Portfolio Update\" is a purchase or sale of securities made on account of a change to your portfolio. \"Position Transfer\" is a transfer of"],
			["securities from one goal to another, either within your account or between different accounts."],
			["REPRESENTATIONS: Descriptive words in the title of any security are used for identification purposes only and do not constitute representations."],
			["Page ","2"," of ","2"],
			["EXECUTION: The time of execution, the name of the buyer or seller, and the commission charged to the other party if we acted as a dual agent, are available"],
			["upon written request."],
			["FRACTIONAL SHARES: Your account holds fractional share interests in securities. Please note that fractional share amounts are typically unrecognized and"],
			["illiquid outside the Betterment platform and fractional shares might not be marketable outside the Betterment platform or transferrable to another brokerage"],
			["account."],
			["REGULATIONS: These transactions are subject to the rules, regulations, and customs of the exchange or market on which they are made and to any and all"],
			["applicable federal, state and/or foreign statutes or regulations."],
			["GOVERNING LAW: The terms and conditions of this confirmation shall be governed by and construed in accordance with the laws of the state of Delaware,"],
			["without giving effect to the conflict of law provision thereof."],
			["IRA CUSTODIAN: Sunwest Trust, Inc., P.O. Box 36371, Albuquerque, NM 87176., is the custodian of IRA accounts."],
			["The products available through Betterment are investment products and as such: (i) are not insured by the Federal Deposit Insurance Corporation (\"FDIC\"); (ii)"],
			["carry no bank or government guarantees, and are not a deposit or other obligation of, or guaranteed by, a bank; and (iii) have associated risks. Client understands"],
			["that investments in securities are subject to investment risks, including possible loss of the principal amount invested. Your uninvested cash balances are subject"],
			["to the terms in the Cash Activity section of your statement."],
			["If you believe there is an inaccuracy or discrepancy between this statement and your account, you should immediately send written notification to Betterment"],
			["Securities Customer Support at support@bettermentsecurities.com and retain a copy for your records. If you have any oral communications with Betterment"],
			["Securities or its affiliates regarding inaccuracies or discrepancies, such communications should be re-confirmed in writing."],
			["Complaints about your Betterment Securities brokerage account may be directed to Betterment Securities at support@bettermentsecurities.com, via phone by"],
			["calling 212-228-1328, or by mail at 61 West 23rd Street, 5th Floor, New York, NY 10010."],
			["Copies of statements and confirmations are available securely at bettermentsecurities.com."]
		];

		var transactions = pdfParser.parse(contributionPdf);

		it('should return the right number of transactions', function () {
			assert.equal(transactions.length, 10);
		});

 		it('should return the right account name', function () {
 			assert(transactions.every(function(tran) {
				return "Build Wealth Goal" == tran.account;
 			}));
		});

 		it('should return the right description', function () {
 			transactions.forEach(function(tran) {
 			 	assert.equal(tran.description, "Automatic Deposit");
			});
		});

 		it('should return the right date', function () {
 			var expectedDate = new Date(2016, 1, 19);
 			transactions.forEach(function(tran) {
 				assert.equal(tran.date.getTime(), expectedDate.getTime());
			});
		});

		it('should return the right tickers', function () {
			var actualTickers = transactions.map(function(tran) {
				return tran.ticker;
			});
			assert.deepEqual(
				actualTickers,
				["VEA", "VTI", "VTV", "VOE", "VBR", "VWO", "MUB", "LQD", "BNDX", "VWOB"]
			);
		});

		it('should return the right prices', function () {
			var actualPrices = transactions.map(function(tran) {
				return tran.price;
			});
			assert.deepEqual(
				actualPrices,
				["33.56", "96.96", "77.10", "79.37", "91.18", "30.65", "111.71", "113.87", "53.85", "74.06"]
			);
		});

		it('should return the right amounts', function () {
			var actualAmounts = transactions.map(function(tran) {
				return tran.amount;
			});
			assert.deepEqual(
				actualAmounts,
				["42.02", "16.11", "14.86", "4.48", "3.71", "5.84", "7.29", "0.85", "2.96", "1.88"]
			);
		});

		it('should return the right quantities', function () {
			var actualQuantities = transactions.map(function(tran) {
				return tran.quantity;
			});
			assert.deepEqual(
				actualQuantities,
				["1.252086", "0.166151", "0.192737", "0.056445", "0.040689",
				"0.190538", "0.065258", "0.007465", "0.054968", "0.025385"]
			);
		});
	});
});
