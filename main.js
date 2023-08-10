// 输入框模块
class InputBar {
  constructor() {
    this.inputEle = document.querySelector("input");
    this.btnBox = document.querySelector(".input-buttons");
    // 输入任务
    this.inputTask = document.querySelector(".input-task");
    // 存放已输入的相关文字数据
    this.inputValue = "";
  }

  init() {
    //  点击添加任务框
    this.inputEle.addEventListener("focus", (e) => {
      this.inputEle.classList.add("input-focus");
      this.btnBox.style.opacity = 1;
      //  判断是否已经输入文字
      if (this.inputValue) {
        this.inputTask.style.opacity = 0;
      } else {
        this.inputTask.style.opacity = 1;
      }
      // 把保存在实例中之前已经输入的文字数据给到input的value属性显示出来
      e.currentTarget.value = this.inputValue;
    });

    // 鼠标移出输入框
    this.inputEle.addEventListener("blur", (e) => {
      this.inputEle.classList.remove("input-focus");
      this.btnBox.style.opacity = 0;
      this.inputTask.style.opacity = 0;
      // 获取已输入的文字
      this.inputValue = e.currentTarget.value;

      // 清空输入的内容
      e.currentTarget.value = "";
    });

    this.inputEle.addEventListener("input", (e) => {
      if (this.inputEle.value === "") {
        this.inputTask.style.opacity = 1;
      } else {
        this.inputTask.style.opacity = 0;
      }
    });

    // 回车添加任务
    this.inputEle.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        if (this.inputEle.value) {
          new TodoCard(todoCard, this.inputEle.value, 0);
          this.inputEle.value = "";
        }
      }
    });
  }
}

const inputBarInstance = new InputBar();
inputBarInstance.init();

//确认取消按钮
class Btn {
  constructor(className) {
    this.btn = document.querySelector(className);
    this.btnType = className.includes("confirm") ? "confirm" : "cancel";
    this.parentInputbar = null;
  }

  init(inputBar) {
    this.installInput(inputBar);
    // 初始化按钮的点击事件
    this.btn.addEventListener("mousedown", (e) => {
      if (this.btnType === "confirm") {
        // 阻止点击按钮元素导致input元素失去焦点
        e.preventDefault();

        if (this.parentInputbar.inputEle.value) {
          new TodoCard(todoCard, this.parentInputbar.inputEle.value, 0);

          // 把输入框清空
          this.parentInputbar.inputEle.value = "";
        }
        this.parentInputbar.inputTask.style.opacity = 1;
      } else {
        // 点击的是cancel按钮要执行的逻辑
        this.parentInputbar.inputEle.value = "";
      }
    });
  }

  installInput(inputBar) {
    this.parentInputbar = inputBar;
  }
}

const confirmBtn = new Btn(".confirm-btn");
confirmBtn.init(inputBarInstance);
const cancelBtn = new Btn(".cancel-btn");
cancelBtn.init(inputBarInstance);

// 待办事项模块
class TodoCard {
  constructor(cardNode, cardText, colorIndex) {
    this.card = cardNode.cloneNode(true);

    //获取日期
    this.TodoDate = document.querySelector(".todo-date");
    this.editBlock = this.card.querySelector(".edit-block");
    this.cardContainer = document.querySelector(".todo-card-container");
    this.barIcons = this.card.querySelector(".group-icons");
    this.groupIcons = this.card.querySelector(".group-icons").children;
    this.doneIcon = this.card.querySelector(".icon-box-done-init");
    this.colorSelect = this.card.querySelector(".color-select");

    // 完成图标
    this.doneIcon = this.card.querySelector(".done-icon-box");
    // 卡片是否有文字数据
    this.cardText = cardText ? cardText : null;

    // 卡片的颜色索引位
    this.colorIndex = colorIndex !== null ? colorIndex : null;
    // 所有颜色的名称
    this.cardColors = ["orange", "blue", "green", "yellow", "purple"];
    // 双击可编辑
    this.clickTimeId = 0;
    this.clickCount = 0;

    // 检测删除的计时器ID
    this.deleteId = 0;
    this.cardState = {
      isStar: false,
    };
    this.init();
  }
  init() {
    // 显示日期
    this.GetTodoDate();

    // 把创建的卡片添加到卡片容器中
    this.appendCard(this.isCreate);

    // 初始已有的输入卡片内容 设置到 this.cardText中
    if (this.cardText !== null) {
      this.editBlock.innerText = this.cardText;
    }

    // 初始化卡片的颜色 随机颜色
    if (this.colorIndex === null) {
      this.colorIndex = 0;
    }

    // 先删除卡片本来的颜色
    this.card.classList.remove("card-orange");
    this.card.classList.add("card-" + this.cardColors[this.colorIndex]);

    // 双击输入
    this.card.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();

      clearTimeout(this.clickTimeId);
      this.clickCount++;

      if (this.clickCount === 2) {
        this.editBlock.focus();
      }
      this.clickTimeId = setTimeout(() => {
        this.clickCount = 0;
      }, 200);
    });

    // 鼠标移入卡片区域 图标出现
    this.card.addEventListener("mouseenter", (e) => {
      const groupIconsArr = [...this.groupIcons];

      groupIconsArr.forEach((icon) => {
        icon.classList.remove("icon-init");
        icon.firstElementChild.classList.remove("svg-init");
      });
      this.doneIcon.classList.remove("icon-box-done-init");
      this.doneIcon.firstElementChild.classList.remove("svg-done-init");
    });

    // 鼠标移出卡片区域 图标消失
    this.card.addEventListener("mouseleave", (e) => {
      const groupIconsArr = [...this.groupIcons];

      groupIconsArr.forEach((icon, index) => {
        // console.log(this.cardState.isStar,index)
        if (this.cardState.isStar && index === 2) {
        } else {
          icon.classList.add("icon-init");
          icon.firstElementChild.classList.add("svg-init");
        }
      });

      this.doneIcon.classList.add("icon-box-done-init");
      this.doneIcon.firstElementChild.classList.add("svg-done-init");
      setTimeout(() => {
        this.colorSelect.classList.add("color-init");
      }, 400);
    });

    // 点击完成图标
    this.doneIcon.addEventListener("click", () => {
      this.moveCardToDone();
    });

    // 点击调色板按钮 出现颜色盘
    this.groupIcons[1].addEventListener("click", (e) => {
      this.colorSelect.classList.toggle("color-init");
    });

    // 点击选择卡片颜色
    this.colorSelect.addEventListener("click", (e) => {
      e.stopPropagation();

      if (e.target.nodeName === "SPAN") {
        const colorClass = e.target.className;
        const basicClass = this.card.className.split(" ")[0];
        this.card.className = basicClass + " " + colorClass;
        const getcolor = colorClass.split("-")[1];
        this.colorIndex = this.cardColors.indexOf(getcolor);
      }
    });

    // 点击五角星 图标固定
    this.groupIcons[2].addEventListener("click", (e) => {
      this.cardState.isStar = !this.cardState.isStar;
      e.currentTarget.children[0].children[1].style.fill = this.cardState.isStar
        ? "yellow"
        : "white";
    });

    // 长按删除
    this.groupIcons[0].addEventListener("mousedown", (e) => {
      const target = e.currentTarget.children[1].firstElementChild;
      target.style.strokeDashoffset = "0";
      const styles = getComputedStyle(target);

      this.deleteId = setInterval(() => {
        if (parseInt(styles.strokeDashoffset) === 0) {
          this.deleteCard();
          clearInterval(this.deleteId);
        }
      }, 100);
    });

    this.groupIcons[0].addEventListener("mouseup", (e) => {
      const target = e.currentTarget.children[1].firstElementChild;
      const styles = getComputedStyle(target);

      if (parseInt(styles.strokeDashoffset) > 0) clearInterval(this.deleteId);
      target.style.strokeDashoffset = "88";
    });
  }

  // 获取日期时间
  GetTodoDate() {
    // 显示日期
    var Date1 = new Date();
    var year = Date1.getFullYear();
    var month = Date1.getMonth();
    var date = Date1.getDate();
    var week_index = Date1.getDay();
    var week = ["日", "一", "二", "三", "四", "五", "六"];
    var tododate =
      year +
      "年" +
      (month + 1) +
      "月" +
      date +
      "日" +
      "\xa0\xa0星期" +
      week[week_index];
    this.TodoDate.innerText = tododate;
  }

  // 添加卡片
  appendCard(isCreate) {
    this.cardContainer.appendChild(this.card);
  }

  // 把待办事项卡偏转换成已完成事项卡片的效果
  // 本质上 其实是先把待办卡删除  然后再创建一个已完成卡片的实例
  moveCardToDone() {
    this.cardText = this.editBlock.innerText;

    setTimeout(() => {
      this.card.remove(); // 真正让卡片从DOM树上消失
    }, 300);

    setTimeout(() => {
      new DoneCard(doneCard, this.cardText, this.colorIndex);
    }, 300);
  }
  // 删除卡片
  deleteCard() {
    setTimeout(() => {
      this.card.remove(); // 卡片删除
    }, 400);
    this.card.style.width = "0px";
    this.card.style.paddingLeft = "0px";
    this.card.style.paddingRight = "0px";
    this.card.style.opacity = 0;
    this.card.style.marginRight = "0px";
    this.barIcons.style.display = "none";
  }
}

const todoCard = document.querySelector(".todo-card");
todoCard.remove();
const card1 = new TodoCard(todoCard, "写代码", 3);

// 完成事项模块
class DoneCard {
  constructor(doneCard, textValue, colorIndex) {
    this.cardContainer = document.querySelector(".done-card-container");
    this.card = doneCard.cloneNode(true);
    this.iconsBar = this.card.querySelector(".done-card-icons");
    // 接收文本
    this.textSpan = this.card.querySelector(".card-text");
    this.textValue = textValue;
    // 获取颜色
    this.colorIndex = colorIndex;
    this.cardColors = ["orange", "blue", "green", "yellow", "purple"];

    this.init();
  }
  init() {
    this.appendCard();

    // 设置文本内容
    this.textSpan.innerText = this.textValue;
    // 初始化效果鼠标移入   完成卡片的控制图标出现
    this.card.addEventListener("mouseenter", (e) => {
      const allChildArr = [...this.iconsBar.children];

      allChildArr.forEach((icon, index) => {
        if (icon.classList.contains("icon-box")) {
          icon.firstElementChild.style.transform = "rotate(0deg)";
          icon.style.transform = "translateX(0px)";
          icon.style.opacity = 1;
        }
      });
    });
    // 初始化 鼠标移出 完成卡片的控制图标消失
    this.card.addEventListener("mouseleave", (e) => {
      const allChildArr = [...this.iconsBar.children];

      allChildArr.forEach((icon, index) => {
        if (icon.classList.contains("icon-box")) {
          icon.firstElementChild.style.transform = "rotate(15deg)";
          icon.style.transform = "translateX(20px)";
          icon.style.opacity = 0;
        }
      });
    });

    // 删除键长按与放开  和待办事项卡片的逻辑是一样的
    this.iconsBar.children[0].addEventListener("mousedown", (e) => {
      const target = e.currentTarget.children[1].firstElementChild;
      target.style.strokeDashoffset = "0";
      const styles = getComputedStyle(target);

      this.deleteId = setInterval(() => {
        if (parseInt(styles.strokeDashoffset) === 0) {
          this.deleteCard();
          clearInterval(this.deleteId);
        }
      }, 100);
    });

    this.iconsBar.children[0].addEventListener("mouseup", (e) => {
      const target = e.currentTarget.children[1].firstElementChild;
      const styles = getComputedStyle(target);
      // console.log(styles.strokeDashoffset)
      if (parseInt(styles.strokeDashoffset) > 0) {
        clearInterval(this.deleteId);
        target.style.strokeDashoffset = "88";
      }
    });

    // 返回todo

    this.iconsBar.children[1].addEventListener("click", (e) => {
      this.backToDo();
      setTimeout(() => {
        this.card.remove(); // 把待办卡片删除
      }, 400);
    });
  }

  appendCard() {
    this.cardContainer.appendChild(this.card);
    setTimeout(() => {
      this.card.classList.remove("done-card-init");
    }, 50);
  }

  deleteCard() {
    // this.card.remove()
    this.card.style.width = "0px";
    this.card.style.paddingLeft = "0px";
    this.card.style.paddingRight = "0px";
    this.card.style.opacity = 0;
    this.card.style.marginRight = "0px";
    this.iconsBar.style.display = "none";
    this.textSpan.style.opacity = 0;

    setTimeout(() => {
      this.card.remove();
    }, 400);
  }

  backToDo() {
    this.card.classList.add("done-card-init");

    // 创建一个新的待办卡片
    new TodoCard(todoCard, this.textValue, this.colorIndex);
  }
}

const doneCard = document.querySelector(".done-card");
doneCard.remove();
