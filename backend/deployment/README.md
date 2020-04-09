# Deployment instructions

## Packages needed

- nginx
- MongoDB
- [Node](https://github.com/nodesource/distributions/blob/master/README.md#debinstall)
- [Docker](https://www.itzgeek.com/how-tos/linux/debian/how-to-install-docker-on-debian-9.html)
- PM2 (`npm install -g pm2`)

## File structure

```
/
    etc
        nginx
            sites_available
                codelm
            sites_enabled
                codelm (symlink via ln -s)
    
    home
        codelm
            ecosystem.config.js
            update.sh
            files/ (where files are uploaded to)
            dist/ (production build directory)

    root
        certs
            newwavecomputers.com.key
            newwavecomputers.com.pem
```
