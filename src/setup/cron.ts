import { CronJob } from 'cron';
import execMonitors from '../task/exec-monitors';

const EVERY_MINUTE = '* * * * *';

export default (): void => {
  const job = new CronJob(EVERY_MINUTE, execMonitors);
  job.start(); 
};
