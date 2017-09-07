[General]
SyntaxVersion=2
BeginHotkey=112
BeginHotkeyMod=0
PauseHotkey=144
PauseHotkeyMod=0
StopHotkey=123
StopHotkeyMod=0
RunOnce=1
EnableWindow=
MacroID=82b00cc8-122a-4bd1-bb2f-270b713b8b89
Description=普亿实业
Enable=1
AutoRun=0
[Repeat]
Type=0
Number=1
[SetupUI]
Type=2
QUI=
[Relative]
SetupOCXFile=
[Comment]

[Script]
//----------------------------------扫描邮件------------------------------------------------
Call Plugin.Msg.Tips("脚本开始运行")
Rem 扫描
Call Plugin.Msg.Tips("扫描")
FindPic 0,0,1024,768,"D:\按键精灵\按键精灵2014\screen\gupiao\回降中.bmp",0.9,yjX1,yjY1
If yjX1 > 0 And yjY1 > 0 Then 
MoveTo yjX1 + 20, yjY1 + 5
LeftClick 1
Goto 卖出
End If
FindPic 0,0,1024,768,"D:\按键精灵\按键精灵2014\screen\gupiao\回升中.bmp",0.9,yjX3,yjY3
If yjX3 > 0 And yjY3 > 0 Then 
MoveTo yjX3 + 20, yjY3 + 5
LeftClick 1
Goto 买入
End If
Delay 1000'等待1秒
Dim MySec
MySec = Second(Now) 'MySec 包含代表当前秒的数字。
If MySec = 5 Then 
Goto 返回邮件列表
End If
Goto 扫描
Rem 返回邮件列表
Call Plugin.Msg.Tips("返回邮件列表")
FindPic 0,0,1024,768,"D:\按键精灵\按键精灵2014\screen\gupiao\收件箱.bmp",0.9,yjX2,yjY2
If yjX2 > 0 And yjY2 > 0 Then 
MoveTo yjX2 + 20, yjY2 + 5
LeftClick 1
Delay 1000'等待1秒
Goto 扫描
End If
//----------------------------------买入卖出----------------------------------------------------
Rem 买入
Call Plugin.Msg.Tips("买入")
FindPic 0,0,1024,768,"D:\按键精灵\按键精灵2014\screen\gupiao\买入.bmp",0.9,intX,intY
If intX > 0 And intY > 0 Then 
MoveTo intX + 20, intY + 5
LeftClick 1
End If
Delay 1000'等待1秒
Goto 获取列表
Rem 卖出
Call Plugin.Msg.Tips("卖出")
FindPic 0,0,1024,768,"D:\按键精灵\按键精灵2014\screen\gupiao\卖出.bmp",0.9,cX,cY
If cX > 0 And cY > 0 Then 
MoveTo cX + 20, cY + 5
LeftClick 1
End If
Delay 1000'等待1秒
Rem 获取列表
Call Plugin.Msg.Tips("获取列表")
FindPic 0,0,1024,768,"D:\按键精灵\按键精灵2014\screen\gupiao\输入密码.bmp",0.9,srX1,srY1
If srX1 > 0 And srY1 > 0 Then 
SayString "403877"
FindPic 0, 0, 1024, 768, "D:\按键精灵\按键精灵2014\screen\gupiao\登录.bmp", 0.9, dlX1, dlY1
MoveTo dlX1, dlY1
LeftClick 1
End If
FindPic 0,0,1024,768,"D:\按键精灵\按键精灵2014\screen\gupiao\交易已锁定.bmp",0.9,cX1,cY1
If cX1 > 0 And cY1 > 0 Then 
MoveTo cX1 + 20, cY1 + 5
LeftClick 1
Delay 500'等待
SayString "403877"
MoveTo 361, 328
LeftClick 1
End If
FindPic 0, 0, 1024, 768, "D:\按键精灵\按键精灵2014\screen\gupiao\断开链接.bmp", 0.9, dkljX1, dkljY1
FindPic 0,0,1024,768,"D:\按键精灵\按键精灵2014\screen\gupiao\退出.bmp",0.9,tcX1,tcY1
If dkljX1 > 0 And dkljY1 > 0 Then
MoveTo tcX1, tcY1
LeftClick 3
Delay 500'等待
Rem 获取智远
Call Plugin.Msg.Tips("获取智远图标")
FindPic 0,0,1024,768,"D:\按键精灵\按键精灵2014\screen\gupiao\智远.bmp",0.9,zyX1,zyY1
If zyX1 > 0 And zyY1 > 0 Then 
MoveTo zyX1, zyY1
LeftClick 2
Else 
Goto 获取智远
End If
End If
Delay 1000'等待1秒
FindPic 0,0,1024,768,"D:\按键精灵\按键精灵2014\screen\gupiao\普亿实业.bmp",0.9,intX1,intY1
If intX1 > 0 And intY1 > 0 Then 
MoveTo intX1 + 20, intY1 + 5
LeftClick 1
Else 
Delay 500 '等待1
Goto 获取列表
End If
Delay 1000'等待1秒
Rem 获取股票信息
Call Plugin.Msg.Tips("获取股票信息")
FindPic 0,0,1024,768,"D:\按键精灵\按键精灵2014\screen\gupiao\股.bmp",0.9,intX2,intY2
If intX2 > 0 And intY2 > 0 Then 
MoveTo intX2 + 86, intY2 + 10
LeftClick 1
Else 
Delay 500 '等待
Goto 获取股票信息
End If
Delay 1000'等待1秒
FindPic 0,0,1024,768,"D:\按键精灵\按键精灵2014\screen\gupiao\买入卖出确定.bmp",0.9,intX3,intY3
If intX3 > 0 And intY3 > 0 Then 
MoveTo intX3 - 20, intY3 + 60
LeftClick 1
End If
Delay 1000'等待1秒
FindPic 0,0,1024,768,"D:\按键精灵\按键精灵2014\screen\gupiao\确认购买.bmp",0.9,intX4,intY4
If intX4 > 0 And intY4 > 0 Then 
MoveTo intX4 + 20, intY4 + 5
LeftClick 1
End If
Delay 500'等待
Rem 获取结果
Call Plugin.Msg.Tips("获取结果")
FindPic 0, 0, 1024, 768, "D:\按键精灵\按键精灵2014\screen\gupiao\委托结果确定.bmp", 0.9, intX5, intY5
If intX5 > 0 And intY5 > 0 Then
MoveTo intX5 + 10, intY5 + 5
LeftClick 1
Goto 返回
End If
FindPic 0,0,1024,768,"D:\按键精灵\按键精灵2014\screen\gupiao\委托结果确定1.bmp",0.9,intX6,intY6
If intX6 > 0 And intY6 > 0 Then 
MoveTo intX6 + 10, intY6 + 5
LeftClick 1
Goto 返回
End If
Delay 500 '等待
Goto 获取结果
Rem 返回
Call Plugin.Msg.Tips("返回")
Delay 500'等待
FindPic 0,0,1024,768,"D:\按键精灵\按键精灵2014\screen\gupiao\返回.bmp",0.9,intX7,intY7
If intX7 > 0 And intY7 > 0 Then 
MoveTo intX7 + 20, intY7 + 5
LeftClick 1
Goto 返回邮件列表
End If
FindPic 0,0,1024,768,"D:\按键精灵\按键精灵2014\screen\gupiao\交易.bmp",0.9,intX8,intY8
If intX8 > 0 And intY8 > 0 Then 
MoveTo intX8 + 20, intY8 + 5
LeftClick 1
Goto 返回邮件列表
End If
//---------------------------------买入end---------------------------------------------------------