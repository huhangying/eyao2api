
# cron: run every day at 1:30 am

chmod +x /home/eyao2api/cron/mongo_backup.sh

# vim命令进入/etc/crontab, 在最后一行加上

30 1 * * * sh /home/eyao2api/cron/mongo_backup.sh

# 重启crontab，使配置生效
/bin/systemctl restart crond.service

# cron服务的日志文件在/var/log/cron文件下