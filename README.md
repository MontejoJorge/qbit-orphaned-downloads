qBittorrent Orphaned Downloads
==============================

Maintains a tag on torrents whose files have no hardlinks

Usage
==============================
### Enviroment Variables
- `INCLUDE_CATEGORY=movies,tv` Comma separated values
- `OMIT_CATEGORY=books` Comma separated values
- `ORPHAN_TAG=orphan` Tagname to add
- `QBIT_HOST=http://localhost:8080` Default http://localhost:8080
- `QBIT_USERNAME=admin` Default admin
- `QBIT_PASSWORD=adminadmin` Default adminadmin
- `INTERVAL_HOURS=6` Default 6 hours

Docker run:
```
docker run -e INCLUDE_CATEGORY=movies,tv -e OMIT_CATEGORY=books -e ORPHAN_TAG=orphan -e QBIT_HOST=http://localhost:8080 -e QBIT_USERNAME=admin -e QBIT_PASSWORD=adminadmin -e INTERVAL_HOURS=6 -v /mnt/media:/media:ro ghcr.io/montejojorge/qbit-orphaned-downloads:latest
```

Docker Compose:
```
version: '3.8'
services:
  qbit-orphaned-downloads:
    image: ghcr.io/montejojorge/qbit-orphaned-downloads:latest
    environment:
      - INCLUDE_CATEGORY=movies,tv
      - OMIT_CATEGORY=books
      - ORPHAN_TAG=orphan
      - QBIT_HOST=http://localhost:8080
      - QBIT_USERNAME=admin
      - QBIT_PASSWORD=adminadmin
      - INTERVAL_HOURS=6
    volumes:
      - /mnt/media:/media:ro
```
