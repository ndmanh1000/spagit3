# Hướng dẫn Deploy

## Lưu trữ dữ liệu

Dự án sử dụng file `data.json` để lưu trữ dữ liệu. Khi deploy lên production:

### Cách 1: Sử dụng Volume (Khuyến nghị cho VPS/Server)
```bash
# Tạo thư mục data persistent
mkdir -p /var/app/data

# Mount volume khi chạy
# data.json sẽ được lưu tại /var/app/data/data.json
```

### Cách 2: Sử dụng Database (Khuyến nghị cho Production)
Để dữ liệu không bị mất khi deploy, nên chuyển sang sử dụng database thực:
- PostgreSQL
- MySQL
- MongoDB

### Cách 3: Backup định kỳ
```bash
# Tạo cron job backup data.json mỗi ngày
0 0 * * * cp /path/to/data.json /path/to/backup/data-$(date +\%Y\%m\%d).json
```

## Lưu ý quan trọng
- File `data.json` đã được thêm vào `.gitignore` để không bị ghi đè khi deploy
- Đảm bảo file `data.json` có quyền ghi (chmod 666) trên server
- Backup dữ liệu thường xuyên
