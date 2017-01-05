const got = require("got");
const { Neuron, Layer, Network, Trainer, Architect } = require("synaptic");
const url = "https://api.coindesk.com/v1/bpi/historical/close.json?start=2010-07-17&end=2017-01-03";

got(url).then(r => JSON.parse(r.body)).then(priceData => {
	const prices = Object.values(priceData.bpi);
	let ratios = [];

	for(let i = 0; i < prices.length - 1; i++) {
		ratios[i] = prices[i + 1] / prices[i];
	}

	ratios = ratios.map(r => r / 10); /* divide by 10 so all under 1 */

	const network = new Architect.Perceptron(1, 3, 1);
	const trainer = new Trainer(network);

	const trainingSet = [];

	for(let i = 0; i < ratios.length - 1; i++) {
		trainingSet.push({
			input: [ ratios[i] ],
			output: [ ratios[i + 1] ]
		});
	}

	trainer.train(trainingSet, { iterations: 10 * 1000 });

	const today = prices[prices.length - 1];
	const tomorrow = prices[prices.length - 1] * network.activate([ ratios[ratios.length - 1] ]) * 10;

	console.log(`${today} ${tomorrow} ${today < tomorrow}`);
});
