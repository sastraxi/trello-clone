import root from './root';
import incomingWebhook from './incoming-webhook';
import createMonitor from './monitor/create';
import createMonitorForm from './monitor/create-form';
import deleteMonitor from './monitor/delete';

export default {
  root,
  monitor: {
    create: createMonitor,
    createForm: createMonitorForm,
    delete: deleteMonitor,
  },
  incomingWebhook,  
};
