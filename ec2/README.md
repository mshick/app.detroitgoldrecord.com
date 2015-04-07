SET UP DGR:
# m3.large Amazon Linux AMI / 40gb SSD EBS

# SSH
ssh -i ~/.ssh/foo@bar.com

# Set up file system
sudo yum update
sudo yum install xfsprogs
sudo mkdir /media/ebs
sudo mkfs -t xfs /dev/xvdb
sudo mount /dev/xvdb /media/ebs
# set fstab
sudo cat '/dev/xvdb   /media/ebs  xfs     defaults,nofail   0   2’ >> /etc/fstab

# Set up app dirs
sudo mkdir /opt/dgr-api
sudo mkdir /var/opt/dgr-api
sudo mkdir /var/opt/log
sudo mkdir /var/opt/log/dgr-api
sudo chown -R ec2-user:wheel /opt/dgr-api/
sudo chown -R ec2-user:wheel /var/opt/dgr-api/
sudo chown -R ec2-user:wheel /var/opt/log/dgr-api/

# Set up git repo and hook
sudo yum install -y git
mkdir ~/dgr-api.git
cd ~/dgr-api.git
git init --bare

## Install ./hooks/post-receive -> ~/dgr-api.git/hooks/post-receive

# Set up mongo
(4real) http://docs.mongodb.org/manual/tutorial/install-mongodb-on-red-hat-centos-or-fedora-linux/
## before starting
sudo mv /etc/mongod.conf.rpmsave /etc/mongod.conf
sudo mkdir /media/ebs/mongodb
sudo chown -R mongod:mongod /media/ebs/mongodb
## edit dbpath to /media/ebs/mongodb
sudo chkconfig mongod on
sudo service mongod start
## log in, set up some indexes! (createdAt, submitted, hidden, approved)
## test it: netstat -tulpn | grep mongod

# Set up redis
sudo yum install -y --enablerepo=epel redis
sudo chkconfig redis on
sudo service redis start

# Set up node 0.11
yum groupinstall "Development Tools" "Development Libraries"
cd ~
curl https://raw.githubusercontent.com/creationix/nvm/v0.13.1/install.sh | bash
source ~/.bash_profile
nvm install v0.11.13
nvm use v0.11.13
nvm alias default v0.11.13
npm install node-gyp -g

# Set up pm2
sudo npm install pm2 -g --unsafe-perm
sudo pm2 startup centos

# Copy your ssh key for git updates (from local machine)
cat ~/.ssh/id_rsa.pub | ssh -i ~/.ssh/foo@bar.com "cat>> .ssh/authorized_keys”

# Add remote (from local machine)
git remote add ec2.dgr ec2-user@bar.com:dgr-api.git
git push ec2.dgr

# Start processes (remote)
cd /opt/dgr-api
pm2 start processes.json
pm2 save

# Forward the http port
sudo iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8000
sudo /sbin/service iptables save

# Set up auto snapshots:

aws config ->
## key
## secret
## region: us-west
## output: text

sudo git clone git@github.com:colinbjohnson/aws-missing-tools.git /usr/local/share/aws-missing-tools
sudo chown -R ec2-user:root /usr/local/share/aws-missing-tools

sudo ln -s /usr/local/share/aws-missing-tools/ec2-automate-backup/ec2-automate-backup-awscli.sh /usr/local/bin/ec2-automate-backup
chmod +x /usr/local/share/aws-missing-tools/ec2-automate-backup/ec2-automate-backup-awscli.sh
chown ec2-user:root /usr/local/bin/ec2-automate-backup

## Install ./scripts/ec2-backup.sh -> ~/home/ec2-user/scripts/ec2-backup.sh
chmod +x ~/scripts/ec2-backup.sh

## Install ./cron.daily -> /etc/cron.daily
sudo touch /var/log/ec2-backup.log
sudo chown ec2-user:root /var/log/ec2-backup.log


