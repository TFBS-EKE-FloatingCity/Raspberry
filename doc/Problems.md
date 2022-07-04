## Journctl is stuck
1. Stop simulation service: ``` systemctl stop simulation ```
2. Restart Journald service:  
   One of those will fix it, try it in the the written order  
   ``` systemctl restart systemd-journald ```  
   ``` systemctl force-reload systemd-journald ```  
   ``` systemctl daemon-reload ```
3. Start simulation service: ``` systemctl start simulation ```
4. look status: ``` systemctl status simulation ```
5. Show journal: ``` journalctl -u simulation -f ```
