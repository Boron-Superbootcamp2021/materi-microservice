const { ServiceBroker } = require("moleculer");
const HTTPServer = require("moleculer-web");

const brokerNodeTransaction = new ServiceBroker({
  namespace: "dev",
  nodeID: "node-transaction",
  transporter: "NATS"
});

brokerNodeTransaction.createService({
    name: "transaction",
    mixins: [DbService],
  
    settings: {
      fields: ["_id", "to", "from", "value"],
        entityValidator: {
                  to: "string",
                  from: "string",
                  value: "string"
              }
     },
  
    actions: {
        listTransaction: {
            async handler(ctx) {
                return this.broker.call("transaction.find", {}).then((res) => {
                    await this.broker.call("loggers.createLog", { action: "Get transactions list", date: new Date()});
                    console.log("Berhasil get", res);
                    return res;
                }).catch((err) => {
                    console.log(err);
                });
            }
        },
        createTransaction: {

            async handler(ctx) {
                return this.broker.call("transaction.create", ctx.params).then((res) => {
                    await this.broker.call("users.getUser", { id: ctx.params.id});
                    await this.broker.call("users.getUser", { to: ctx.params.to});
                    await this.broker.call("users.getUser", { from: ctx.params.from});
                    await this.broker.call("loggers.createLog", { action: "Transaction", date: new Date()});
                    console.log("Transaction success", res);
                    return res;
                }).catch((err) => {
                    console.log(err);
                    return err;
                });;
            }
        },
        deleteTransaction: {
            async handler(ctx) {
                this.broker.call("transaction.remove", ctx.params).then((res) => {
                    await this.broker.call("users.getUser",{id:ctx.params.id});
                    await this.broker.call("loggers.createLog", { action: "Delete transaction", date: new Date() });
                    console.log("berhasil Delete");
                    return "Delete Berhasil";
                }).catch((err) => {
                    return (err);
                });
            }
        }
    },
  
    afterConnected() {
        
    }
  });
  
  Promise.all([brokerNodeTransaction.start()]).then(() => {
    brokerNodeTransaction.repl();
  });