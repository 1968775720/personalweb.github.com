// JavaScript Document
var kuan = 20,   //单位方块的宽
	gao = 20,    //单位方块的高
	hang = 40,   //行数
	lie = 40;    //列数
var snake=null,  //蛇的实例
	food=null,   //食物的实例
	game=null;   //游戏实例

function Square(x,y,classname){
	this.x=x*kuan;
	this.y=y*gao;
	this.class=classname;
	this.viewContent=document.createElement('div');  //单位方块对应的dom元素
	this.viewContent.className=this.class;
	this.parent=document.getElementById('snakewrap');  //方块的父级
}
Square.prototype.create=function(){  //给原型添加方法，创建方块dom
	this.viewContent.style.position='absolute';
	this.viewContent.style.width=kuan+'px';
	this.viewContent.style.height=gao+'px';
	this.viewContent.style.left=this.x+'px';
	this.viewContent.style.top=this.y+'px';
	
	this.parent.appendChild(this.viewContent);  //添加到页面
};
Square.prototype.remove=function(){  //移除方块
	this.parent.removeChild(this.viewContent);  
};
function Snake(){
	this.head=null;  //存蛇头信息
	this.tail=null;  //存蛇尾信息
	this.pos=[];  //二维数组储存蛇身每个方块的位置信息
	this.directionNum={  //用一个对象存储蛇行走的方向
		left:{
			x:-1,
			y:0
		},
		right:{
			x:1,
			y:0
		},
		up:{
			x:0,
			y:-1
		},
		down:{
			x:0,
			y:1
		}
	}
}
Snake.prototype.init=function(){
	var snakehead=new Square(2,0,'head');  //创建蛇头
	snakehead.create();  //实例继承调用create显示到页面
	this.head=snakehead;  //存储蛇头信息
	this.pos.push([2,0]);  //储存蛇头位置
	
	var snakebody1=new Square(1,0,'body');  //创建蛇身
	snakebody1.create();
	this.pos.push([1,0]);  //把蛇身体坐标储存
	
	var snakebody2=new Square(0,0,'body');  //创建蛇身
	snakebody2.create();
	this.pos.push([0,0]);  //把蛇身体坐标储存
	this.tail=snakebody2;
	
	//将整个蛇形成链表关系
	snakehead.last=null;
	snakehead.next=snakebody1;
	
	snakebody1.last=snakehead;
	snakebody1.next=snakebody2;
	
	snakebody2.last=snakebody1;
	snakebody2.next=null;
	
	//给蛇加一条属性用来表示蛇走的方向
	this.direction=this.directionNum.right;  //默认朝右边走
};

//声明方法获取蛇头下一个元素，并作出不同响应
Snake.prototype.getNextPos=function(){
	var nextPos=[  //蛇头对应下一个点的坐标
		this.head.x/kuan+this.direction.x,
		this.head.y/gao+this.direction.y
	]
//撞到自己游戏结束
    var selfcollied=false;
    this.pos.forEach(function(value){
		if(value[0]==nextPos[0] && value[1]==nextPos[1]){ //如果数组中两个数据相等，说明下个点在蛇身上
			selfcollied=true;
		}
    });
    if(selfcollied){
		this.strategies.gameover.call(this);  //call用来修改对象调用原型
		return;
    }
//撞到墙壁游戏结束
    if(nextPos[0]<0 || nextPos[1]<0 || nextPos[0]>lie-1 || nextPos[1]>hang-1){  //判断是否撞到左、上、右、下边界
		this.strategies.gameover.call(this);
		return;
    }
//撞到苹果，吃掉
	if(food && food.pos[0]==nextPos[0] && food.pos[1]==nextPos[1]){  //满足条件表明蛇头下一个点是苹果
		this.strategies.eat.call(this);
		return;
	}
	this.strategies.move.call(this);
};

//处理碰撞后的行动
Snake.prototype.strategies={
	move:function(format){  //format参数用于决定是否删除蛇尾
		//在旧蛇头位置创建新身体
		var newbody=new Square(this.head.x/kuan,this.head.y/gao,'body');
		//更新链表关系
		newbody.next=this.head.next;
		newbody.next.last=newbody;
		newbody.last=null;
		
		this.head.remove(); //移除旧蛇头
		newbody.create(); //创建新身体
		//创建新蛇头
		var newhead=new Square(this.head.x/kuan+this.direction.x,this.head.y/gao+this.direction.y,'head');
		//更新链表关系
		newhead.next=newbody;
		newhead.last=null;
		newbody.last=newhead;
		newhead.create();
		
		//更新蛇的坐标信息
		this.pos.unshift([this.head.x/kuan+this.direction.x,this.head.y/gao+this.direction.y]);
		this.head=newhead;
		
		if(!format){  //若format为false，表示没吃到苹果需要删除蛇尾
			this.tail.remove();
			this.tail=this.tail.last;
//			this.pos.pop();  //删除数组最后一个元素
		}
		var passedway=new Square(this.tail.x/kuan,this.tail.y/gao,'body');
		passedway.create();
	},
	eat:function(){
		this.strategies.move.call(this,true);
		createfood();
		game.score++;
	},
	gameover:function(){
		game.over();
	}
}
snake=new Snake();

//创建食物
function createfood(){
	var x=null;
	var y=null;
	var include=true;  //true表示苹果坐标在蛇身上，继续循环，反之跳出循环
	while(include){
		x=Math.round(Math.random()*(hang-1));  //round为四舍五入
		y=Math.round(Math.random()*(lie-1));
		
		snake.pos.forEach(function(value){
			if(x!=value[0] && y!=value[1]){  //条件成立说明随机坐标不在蛇身上
				include=false;
			}
		});
	}
	//生成食物
	food=new Square(x,y,'food');
	food.pos=[x,y];  //存储苹果坐标
	var fooddom=document.querySelector('.food');
	if(fooddom){
		fooddom.style.left=x*kuan + 'px';
		fooddom.style.top=y*gao + 'px';
	}else{
		food.create();
	}
}

//创建可控游戏逻辑
function Game(){
	this.timer=null;
	this.score=0;
}
Game.prototype.init=function(){
	snake.init();
	//snake.getNextPos();
	createfood();
	
	document.onkeydown=function(ev){
		if(ev.which==37 && snake.direction!=snake.directionNum.right){  //37代表左键
			snake.direction=snake.directionNum.left;
		}else if(ev.which==38 && snake.direction!=snake.directionNum.down){
			snake.direction=snake.directionNum.up;
		}else if(ev.which==39 && snake.direction!=snake.directionNum.left){
			snake.direction=snake.directionNum.right;
		}else if(ev.which==40 && snake.direction!=snake.directionNum.up){
			snake.direction=snake.directionNum.down;
		}
	}
	this.start();
}
Game.prototype.start=function(){
	this.timer=setInterval(function(){
		snake.getNextPos();
	},200);
}
Game.prototype.pause=function(){
	clearInterval(this.timer);
}
Game.prototype.over=function(){
	clearInterval(this.timer);
	alert('您的得分是：'+ this.score);
	
	//回到初始网页
	var snakewrap=document.getElementById('snakewrap');
	snakewrap.innerHTML='';
	snake=new Snake();
	game=new Game();
	var startbtnwrap=document.querySelector('.start');
	startbtnwrap.style.display='block';
}

//开启游戏
game=new Game();
var start=document.querySelector('.start button');
start.onclick=function(){
	start.parentNode.style.display='none';
	game.init();
};

//暂停游戏
var snakewrap=document.getElementById('snakewrap');
var pause=document.querySelector('.pause button');
snakewrap.onclick=function(){
	game.pause();
	pause.parentNode.style.display='block';
}
pause.onclick=function(){
	game.start();
	pause.parentNode.style.display='none';
}














