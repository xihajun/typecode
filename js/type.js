// global vars
var editor; // code mirror instance
var incompleteMark;
var focused = false;
let invalids = [];
var fileLines;
// WPM tracking
var lastStartTime;
var elapsedTime;

let hash = window.location.hash.substring(1);
let hashBits = hash.split("/");
let repo = hashBits.slice(0, 3).join("/");
let filePath = hashBits.slice(3, hashBits.length).join("/");

// language selector
let languageSelecor = $("#language");
languageSelecor.change(() => {
	let selected = languageSelecor.val();
	var language;
	if (selected == "auto-detect") {
		language = getLanguageByExtension(getFileExtension());
	} else {
		language = languages[selected];
	}
	setLanguage(language);
});
for (key in languages) {
	languageSelecor.append(`<option value="${key}">${key}</option>`);
}

// theme selector
let themeSelector = $("#theme");
themeSelector.change(() => {
	setTheme(themeSelector.val());
	save();
});

//insert
Array.prototype.insert = function ( index, item ) {
    this.splice( index, 0, item );
};
// restart button
$("#restart").click(() => {
	localforage.getItem(repo)
		.then((val) => {
			val[filePath] = {};
			localforage.setItem(repo, val)
				.then(() => {
					window.location.reload();
				})
				.catch((e) => {
					throw e;
				});
		})
		.catch((e) => {
			throw e;
		});
});

// restart button
$("#random").click(() => {

});

// back button
$("#back").click(() => {
	window.location.href = `repo.html#${repo}`;
});
myFunction()
// fetch file and setup
function myFunction(){
    // var urls = ['https://raw.githubusercontent.com/xihajun/SmartDevice/main/test1.py',
	//       'https://raw.githubusercontent.com/ZHUANGHP/LeetCode-Solution-Python/master/tree/0094-binary-tree-inorder-traversal-1.py']
    // var urls = ['https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/166分数到小数/166分数到小数.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/057插入区间/057插入区间.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/064最小路径和/064最小路径和.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/068文本左右对齐/068文本左右对齐.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/051N皇后/051N皇后.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/173二叉搜索树迭代器/173二叉搜索树迭代器.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/061旋转链表/061旋转链表.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/097交错字符串/097交错字符串.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/058最后一个单词的长度/058最后一个单词的长度.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/100相同的树/100相同的树.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/052N皇后II/052N皇后II.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/088合并两个有序数组/088合并两个有序数组.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/005最长回文子串/005最长回文子串.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/241为运算表达式设计优先级/241为运算表达式设计优先级.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/101对称二叉树/101对称二叉树.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/014最长公共前缀/014最长公共前缀.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/069x的平方根/069x的平方根.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/003无重复字符的最长子串/003无重复字符的最长子串.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/154寻找旋转排序数组中的最小值 II/154寻找旋转排序数组中的最小值 II.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/096不同的二叉搜索树/096不同的二叉搜索树.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/001两数之和/001两数之和.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/025k个一组翻转链表/025k个一组翻转链表.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/162寻找峰值/162寻找峰值.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/054螺旋矩阵/054螺旋矩阵.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/117填充每个节点的下一个右侧节点指针 II/117填充每个节点的下一个右侧节点指针 II.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/036有效的数独/036有效的数独.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/204计数质数/204计数质数.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/080删除排序数组中的重复项 II/080删除排序数组中的重复项 II.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/135分发糖果/135分发糖果.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/164最大间距/164最大间距.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/066加一/066加一.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/113路径总和II/113路径总和II.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/227基本计算器 II/227基本计算器 II.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/083删除排序链表中的重复元素/083删除排序链表中的重复元素.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/114二叉树展开为链表/114二叉树展开为链表.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/031下一个排列/031下一个排列.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/033搜索旋转排序数组/033搜索旋转排序数组.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/055跳跃游戏/055跳跃游戏.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/134加油站/134加油站.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/133克隆图/133克隆图.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/245最短单词距离 III/245最短单词距离 III.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/040组合总和II/040组合总和II.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/174地下城游戏/174地下城游戏.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/242有效的字母异位词/242有效的字母异位词.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/092反转链表II/092反转链表II.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/139单词拆分/139单词拆分.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/140单词拆分 II/140单词拆分 II.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/028实现strStr()/028实现strStr().py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/188买卖股票的最佳时机 IV/188买卖股票的最佳时机 IV.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/079单词搜索/079单词搜索.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/222完全二叉树的节点个数/222完全二叉树的节点个数.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/099恢复二叉搜索树/099恢复二叉搜索树.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/023合并K个排序链表/023合并K个排序链表.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/125验证回文串/125验证回文串.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/075颜色分类/075颜色分类.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/016最接近的三数之和/016最接近的三数之和.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/208实现 Trie (前缀树)/208实现 Trie (前缀树).py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/026删除排序数组中的重复项/026删除排序数组中的重复项.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/147对链表进行插入排序/147对链表进行插入排序.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/142环形链表 II/142环形链表 II.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/232用栈实现队列/232用栈实现队列.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/067二进制求和/067二进制求和.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/086分隔链表/086分隔链表.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/150逆波兰表达式求值/150逆波兰表达式求值.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/236二叉树的最近公共祖先/236二叉树的最近公共祖先.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/160相交链表/160相交链表.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/145二叉树的后序遍历/145二叉树的后序遍历.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/231 2的幂/231 2的幂.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/120三角形最小路径和/120三角形最小路径和.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/109有序链表转换二叉搜索树/109有序链表转换二叉搜索树.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/093复原IP地址/093复原IP地址.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/059螺旋矩阵II/059螺旋矩阵II.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/202快乐数/202快乐数.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/121买卖股票的最佳时机/121买卖股票的最佳时机.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/007反转整数/007反转整数.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/116填充每个节点的下一个右侧节点指针/116填充每个节点的下一个右侧节点指针.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/201数字范围按位与/201数字范围按位与.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/107二叉树的层次遍历II/107二叉树的层次遍历II.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/123买卖股票的最佳时机 III/123买卖股票的最佳时机 III.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/089格雷编码/089格雷编码.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/011盛最多水的容器/011盛最多水的容器.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/190颠倒二进制位/190颠倒二进制位.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/141环形链表/141环形链表.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/143重排链表/143重排链表.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/029两数相除/029两数相除.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/238除自身以外数组的乘积/238除自身以外数组的乘积.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/104二叉树的最大深度/104二叉树的最大深度.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/002两数相加/002两数相加.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/047全排列II/047全排列II.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/179最大数/179最大数.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/077组合/077组合.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/189旋转数组/189旋转数组.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/082删除排序链表中的重复元素 II/082删除排序链表中的重复元素 II.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/072编辑距离/072编辑距离.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/022括号生成/022括号生成.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/153寻找旋转排序数组中的最小值/153寻找旋转排序数组中的最小值.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/110平衡二叉树/110平衡二叉树.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/215数组中的第K个最大元素/215数组中的第K个最大元素.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/220存在重复元素 III/220存在重复元素 III.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/198打家劫舍/198打家劫舍.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/151翻转字符串里的单词/151翻转字符串里的单词.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/013罗马数字转整数/013l罗马数字转整数.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/044通配符匹配/044通配符匹配.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/027移除元素/027移除元素.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/239滑动窗口最大值/239滑动窗口最大值.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/214最短回文串/214最短回文串.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/042接雨水/042接雨水.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/230二叉搜索树中第K小的元素/230二叉搜索树中第K小的元素.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/126单词接龙 II/126单词接龙 II.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/091解码方法/091解码方法.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/030与所有单词相关联的字串/030与所有单词相关联的字串.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/206反转链表/206反转链表.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/226翻转二叉树/226翻转二叉树.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/221最大正方形/221最大正方形.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/010正则表达式匹配/010正则表达式匹配.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/032最长有效括号/032最长有效括号.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/217存在重复元素/217存在重复元素.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/043字符串相乘/043字符串相乘.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/048旋转图像/048旋转图像.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/130被围绕的区域/130被围绕的区域.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/235二叉搜索树的最近公共祖先/235二叉搜索树的最近公共祖先.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/024两两交换链表中的节点/024两两交换链表中的节点.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/119杨辉三角 II/119杨辉三角 II.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/018四数之和/018四数之和.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/243最短单词距离/243最短单词距离.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/136只出现一次的数字/136只出现一次的数字.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/063不同路径II/063不同路径II.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/137只出现一次的数字 II/137只出现一次的数字 II.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/035搜索插入位置/035搜索插入位置.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/168Excel表列名称/168Excel表列名称.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/149直线上最多的点数/149直线上最多的点数.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/244最短单词距离 II/244最短单词距离 II.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/015三数之和/015三数之和.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/009回文数/009回文数.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/115不同的子序列/115不同的子序列.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/070爬楼梯/070爬楼梯.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/129求根到叶子节点数字之和/129求根到叶子节点数字之和.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/084柱状图中最大的矩形/084柱状图中最大的矩形.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/078子集/078子集.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/199二叉树的右视图/199二叉树的右视图.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/213打家劫舍 II/213打家劫舍 II.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/128最长连续序列/128最长连续序列.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/240搜索二维矩阵 II/240搜索二维矩阵 II.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/127单词接龙/127单词接龙.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/169求众数/169求众数.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/191位1的个数/191位1的个数.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/076最小覆盖子串/076最小覆盖子串.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/085最大矩形/085最大矩形.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/200岛屿的个数/200岛屿的个数.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/219存在重复元素 II/219存在重复元素 II.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/118杨辉三角/118杨辉三角.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/012整数转罗马数字/012整数转罗马数字.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/046全排列/046全排列.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/041缺失的第一个正数/041缺失的第一个正数.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/148排序链表/148排序链表.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/071简化路径/071简化路径.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/095不同的二叉搜索树II/095不同的二叉搜索树II.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/098验证二叉搜索树/098验证二叉搜索树.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/155最小栈/155最小栈.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/037解数独/037解数独.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/050Pow(x,n)/050Pow(x,n).py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/138复制带随机指针的链表/138复制带随机指针的链表.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/223矩形面积/223矩形面积.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/087扰乱字符串/087扰乱字符串.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/132分割回文串 II/132分割回文串 II.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/205同构字符串/205同构字符串.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/224基本计算器/224基本计算器.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/237删除链表中的节点/237删除链表中的节点.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/073矩阵置零/073矩阵置零.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/045跳跃游戏II/045跳跃游戏II.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/074搜索二维矩阵/074搜索二维矩阵.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/039组合总和/039组合总和.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/225用队列实现栈/225用队列实现栈.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/034在排序数组中查找元素的第一个和最后一个位置/034在排序数组中查找元素的第一个和最后一个位置.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/209长度最小的子数组/209长度最小的子数组.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/212单词搜索 II/212单词搜索 II.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/102二叉树的层次遍历/102二叉树的层次遍历.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/228汇总区间/228汇总区间.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/152乘积最大子序列/152乘积最大子序列.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/112路径总和/112路径总和.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/094二叉树的中序遍历/094二叉树的中序遍历.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/165比较版本号/165比较版本号.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/053最大子序和/053最大子序和.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/167两数之和 II - 输入有序数组/167两数之和 II - 输入有序数组.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/131分割回文串/131分割回文串.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/122买卖股票的最佳时机 II/122买卖股票的最佳时机 II.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/203移除链表元素/203移除链表元素.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/056合并区间/056合并区间.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/207课程表/207课程表.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/229求众数 II/229求众数 II.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/017电话号码的字符组合/017电话号码的字符组合.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/021合并两个有序链表/021合并两个有序链表.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/060第k个排列/060第k个排列.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/172阶乘后的零/172阶乘后的零.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/008字符串转整数 (atoi)/008字符串转整数 (atoi).py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/233数字 1 的个数/233数字 1 的个数.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/065有效数字/065有效数字.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/103二叉树的锯齿形层次遍历/103二叉树的锯齿形层次遍历.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/081搜索旋转排序数组 II/081搜索旋转排序数组 II.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/187重复的DNA序列/187重复的DNA序列.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/218天际线问题/218天际线问题.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/090子集II/090子集II.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/020有效的括号/020有效的括号.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/210课程表 II/210课程表 II.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/006Z字形变换/006Z字形变换.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/211添加与搜索单词 - 数据结构设计/211添加与搜索单词 - 数据结构设计.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/146LRU缓存机制/146LRU缓存机制.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/171Excel表列序号/171Excel表列序号.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/106从中序与后序遍历序列构造二叉树/106从中序与后序遍历序列构造二叉树.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/108将有序数组转换为二叉搜索树/108将有序数组转换为二叉搜索树.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/062不同路径/062不同路径.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/019删除链表的倒数第N个节点/019删除链表的倒数第N个节点.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/049字母异位词分组/049字母异位词分组.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/234回文链表/234回文链表.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/111二叉树的最小深度/111二叉树的最小深度.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/216组合总和 III/216组合总和 III.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/124二叉树中的最大路径和/124二叉树中的最大路径和.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/038报数/038报数.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/105从前序与中序遍历序列构造二叉树/105从前序与中序遍历序列构造二叉树.py', 'https://raw.githubusercontent.com/wtrnash/LeetCode/master/python/144二叉树的前序遍历/144二叉树的前序遍历.py']
	var urls = ['https://raw.githubusercontent.com/xihajun/typecode/main/code/vgg.py']
    var url = getRandomSubarray(urls, 1);
    
    //var givenurl = document.getElementById("url").value;

//    if(givenurl){
//	url = givenurl
//	window.url = url
//    }else{
//	window.url = url
//	
//    }
//    
    console.log(url)

   // location.reload()
    if(fileLines==null){
	geturlsetup(url)
    }else{
	document.getElementById("restart").click()
	geturlsetup(url)
	
    }

}

function getRandomSubarray(arr, size) {
    var shuffled = arr.slice(0), i = arr.length, temp, index;
    while (i--) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(0, size);
}
function randomsample(){
    var urls = ['https://raw.githubusercontent.com/xihajun/SmartDevice/main/test1.py']
    var randomFiveNumbers = _.sample(urls, 1);
    

}
function geturlsetup(test){
jQuery.get({
    url: test,
	success: (code) => {
	        fileLines = code.split("\n");
	        fileLines.insert(0, '');

       	        console.log(fileLines)
		getChunk(code)
			.then((chunk) => {
				let lang = getLanguageByExtension(getFileExtension());
				console.log(`Detected language as ${lang.mime}`);
				if (Array.isArray(lang.file)) {
					if (lang.file.length != 0) {
						var req = req = $.getScript(`https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.19.0/mode/${lang.file[0]}/${lang.file[0]}.min.js`);
						for (var i = 1; i < lang.file.length; i++) {
							req = req.then($.getScript(`https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.19.0/mode/${lang.file[i]}/${lang.file[i]}.min.js`));
						}
						req.then(() => {
							setup(chunk, lang.mime);
						});
					} else {
						setup(chunk, lang.mime);
					}
				} else {
					$.getScript(`https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.19.0/mode/${lang.file}/${lang.file}.min.js`, () => {
						setup(chunk, lang.mime);
					});
				}
			})
			.catch((e) => {
				throw e;
			})
	}
});

}
// setup
function setup(data, mime) {
	let el = document.getElementById("editor");
	el.value = data;
	editor = CodeMirror.fromTextArea(el, {
		mode: mime,
		readOnly: true,
		autofocus: true,
		extraKeys: {
			Up: () => {},
			Down: () => {},
			Left: () => {},
			Right: () => {}
		}
	});

	editor.setSize("100%", "100%");

	load()
		.then(save)
		.then(() => {
			incompleteMark = editor.doc.markText(editor.getCursor(), getEndPos(), {
				className: "incomplete"
			});

			resume();

			editor.on("focus", handleFocus);
			editor.on("blur", handleBlur);
			editor.on("mousedown", handleMouseDown);

			document.addEventListener("keypress", handleKeyPress);
			document.addEventListener("keydown", handleKeyDown);

		})
		.catch((e) => {
			throw e;
		});
}

function handleFocus() {
	resume();
}

function handleBlur() {
	pause();
}

function handleMouseDown(instance, event) {
	event.preventDefault();
	editor.focus();
}

function handleKeyPress(event) {
	if (focused) {
		event.preventDefault();

		let pos = editor.getCursor();
		let line = editor.doc.getLine(pos.line);
		let char = line.charCodeAt(pos.ch);
		if (event.charCode != char) {
			markInvalid(pos);
		}
		setCursor({ line: pos.line, ch: pos.ch + 1 });
		updateIncompleteMark();
	}
}

function handleKeyDown(event) {
	if (focused) {
		if (event.keyCode == 8) { // delete
			event.preventDefault();
			handleDelete(event);
		} else if (event.keyCode == 13) { // enter
			event.preventDefault();
			handleEnter(event);
		} else if (event.keyCode == 9) { // tab
			event.preventDefault();
			handleTab(event);
		} else if (event.keyCode == 27) { // escape
			event.preventDefault();
			pause();
		}
	} else {
		if (event.keyCode == 27) {
			event.preventDefault();
			resume();
		}
	}
}

function handleDelete(event) {
	let pos = editor.getCursor();
	if (pos.ch == 0) { // move up 1 line
		moveToEndOfPreviousLine();
	} else { // move back 1 char
		let line = editor.doc.getLine(pos.line);
		if (line.hasOnlyWhiteSpaceBeforeIndex(pos.ch)) {
			moveToEndOfPreviousLine();
		} else {
			setCursor({ line: pos.line, ch: pos.ch - 1 });
		}
	}

	let newPos = editor.getCursor();
	let lineInvalids = invalids[newPos.line];
	if (lineInvalids) {
		let mark = lineInvalids[newPos.ch];
		if (mark) {
			mark.clear();
			lineInvalids.splice(newPos.ch, 1);
		}
	}

	updateIncompleteMark();
}


function isCharacterALetter(char) {
  return (/[a-zA-Z]/).test(char)
}


function handleEnter(event) {
	let pos = editor.getCursor();
	let currentLine = editor.doc.getLine(pos.line);
	let trimmed = currentLine.trim();
	if (editor.getCursor().ch >= currentLine.indexOf(trimmed) + trimmed.length) {
		if (pos.line < editor.doc.size - 1) {
			var newLine = pos.line;
			while (true) {
				newLine++;
				if (newLine >= editor.doc.size) { // go to end of last line
					setCursor(getEndPos());
					break;
				} else { // try go to next line
					let newText = editor.doc.getLine(newLine);
				        let newTrimmed = newText.trim();
				    console.log(isCharacterALetter(newTrimmed[0]))
				    if (newTrimmed.length != 0 & isCharacterALetter(newTrimmed[0]) & newTrimmed[0]!='#') { // [xihajun motified for python only] line is not empty (whitespace-only)
						let ch = newText.indexOf(newTrimmed);
						setCursor({ line: newLine, ch: ch });
						break;
					}
				}
			}
			updateIncompleteMark();
			updateWPM();
			save();
		} else {
			goToNextChunk();
		}
	}
}

function handleTab(event) {
	let pos = editor.getCursor();
	let line = editor.doc.getLine(pos.line);
	if (line.charCodeAt(pos.ch) == 9) {
		setCursor({ line: pos.line, ch: pos.ch + 1 });
	}
}

function moveToEndOfPreviousLine() {
	let pos = editor.getCursor();
	if (pos.line > 0) {
		var newLine = pos.line;
		while (true) {
			newLine--;
			if (newLine < 0) {
				setCursor({ line: 0, ch: 0 });
				break;
			}
			let text = editor.doc.getLine(newLine);
			let trimmed = text.trim();
			if (trimmed.length != 0) {
				let ch = text.indexOf(trimmed) + trimmed.length;
				setCursor({ line: newLine, ch: ch });
				save();
				break;
			}
		}
	} else {
		save();
		goToPrevChunk();
	}
}

function isComplete() {
	if (!areAllNextLinesEmpty()) {
		if (incompleteMark.lines.length != 0) {
			return false;
		}
	}

	for (var i = 0; i < invalids.length; i++) {
		let arr = invalids[i];
		if (arr) {
			for (var j = 0; j < arr.length; j++) {
				// invalid marks are sometimes cleared but not removed
				// this can be checked by checking mark.lines.length != 0
				if (arr[j] && arr[j].lines.length != 0) {
					return false;
				}
			}
		}
	}
	return true;
}

function areAllNextLinesEmpty() {
	let pos = editor.getCursor();
	for (var i = pos.line + 1; i < editor.doc.size; i++) {
		let line = editor.doc.getLine(i);
		if (line.trim().length != 0) {
			return false;
		}
	}
	return true;
}

function getStartPos() {
	var line = 0;
	while (true) {
		let text = editor.doc.getLine(line);
		let trimmed = text.trim();
		if (trimmed.length != 0) {
			return { line: line, ch: text.indexOf(trimmed) };
		}
		line++;
	}
}

function getEndPos() {
	var line = editor.doc.size - 1;
	while (true) {
		if (line <= editor.doc.size) {
			return { line: editor.doc.size - 1, ch: editor.doc.getLine(editor.doc.size - 1).length - 1 };
		}
		let text = editor.doc.getLine(line);
		let trimmed = text.trim();
		if (trimmed.length != 0) {
			return { line: line, ch: text.indexOf(trimmed) + trimmed.length };
		}
		line--;
	}
}

function updateIncompleteMark() {
	incompleteMark.clear();
	incompleteMark = editor.doc.markText(editor.getCursor(), getEndPos(), {
		className: "incomplete"
	});
}

function markInvalid(pos) {
	let mark = editor.doc.markText(pos, {line: pos.line, ch: pos.ch + 1}, {
		className: "invalid"
	});
	if (!invalids[pos.line]) invalids[pos.line] = [];
	invalids[pos.line][pos.ch] = mark;
}

function setLanguage(lang) {
	$.getScript(`https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.19.0/mode/${lang.file}/${lang.file}.min.js`, () => {
		editor.setOption("mode", lang.mime);
		console.log(`Changed language to ${lang.mime}`);
	});
}

function getFileExtension() {
	let parts = filePath.split(".");
	return parts[parts.length - 1];
}

function getChunk(code) {
        // get chuck 
	let lines = code.split("\n");
	return localforage.getItem(repo)
		.then((val) => {
			if (val && val[filePath] && val[filePath].chunk) {
				let chunk = val[filePath].chunk;
				let totalChunks = Math.ceil(lines.length / 50);
				if (chunk == totalChunks - 1) {
					return lines.slice(lines.length - (lines.length % 50), lines.length);
				} else {
					return lines.slice(chunk * 50, (chunk + 1) * 50);
				}
			} else {
				if (!val) val = {};
				if (!val[filePath]) val[filePath] = {};
				val[filePath].chunk = 0;
				localforage.setItem(repo, val)
					.catch((e) => {
						throw e;
					});
				return lines.slice(0, 51);
			}
		})
		.then((lines) => {
			return lines.join("\n");
		});
}

function goToNextChunk() {
	if (isComplete()) {
		save()
			.then(() => {
				localforage.getItem(repo)
					.then((val) => {
						let nextChunk = val[filePath].chunk + 1;
						let totalChunks = Math.ceil(fileLines.length / 50);
						if (nextChunk < totalChunks) { // not the last chunk
							val[filePath].chunk = nextChunk;
							localforage.setItem(repo, val)
								.then(() => {
									window.location.reload();
								})
								.catch((e) => {
									throw e;
								});
						} else {
							let hash = window.location.hash;
							window.location.href = `complete.html${hash}`;
						}
					})
					.catch((e) => {
						throw e;
					});
			});
	}
}

function goToPrevChunk() {
	save()
		.then(() => {
			localforage.getItem(repo)
				.then((val) => {
					let prevChunk = val[filePath].chunk - 1;
					if (prevChunk >= 0) {
						val[filePath].chunk = prevChunk;
						localforage.setItem(repo, val)
							.then(() => {
								window.location.reload();
							})
							.catch((e) => {
								throw e;
							});
					}
				})
				.catch((e) => {
					throw e;
				});
		});
}

function load() {
	localforage.getItem("theme")
		.then(loadTheme);
	return localforage.getItem(repo)
		.then((val) => {
			if (val && val[filePath] && val[filePath].hasOwnProperty("chunk") && val[filePath].chunks) {
				let chunk = val[filePath].chunks[val[filePath].chunk];
				loadInvalids(chunk);
				loadCursor(chunk);
				loadElapsedTime(chunk);
			} else {
				save();
			}
		});
}

function save() {
	localforage.setItem("theme", saveTheme());
	return localforage.getItem(repo)
		.then((val) => {
			if (!val) val = {};
			if (!val[filePath]) val[filePath] = {};
			let file = val[filePath];
			
			if (!file.chunk) file.chunk = 0;
			if (!file.chunks) file.chunks = [];
			if (!file.chunks[file.chunk]) file.chunks[file.chunk] = {};
			
			let chunk = file.chunks[file.chunk];
			saveInvalids(chunk);
			saveCursor(chunk);
			saveElapsedTime(chunk);

			localforage.setItem(repo, val)
				.catch((e) => {
					throw e;
				});
		})
		.catch((e) => {
			throw e;
		});
}

function loadInvalids(obj) {
	if (obj && obj.invalids) {
		editor.operation(() => { // buffer all DOM changes together b/c performance
			obj.invalids.forEach(markInvalid);
		});
	}
}

function saveInvalids(obj) {
	let serialized = [];
	for (var i = 0; i < invalids.length; i++) {
		let inner = invalids[i];
		if (!inner) continue;

		for (var j = 0; j < inner.length; j++) {
			let mark = inner[j];
			if (!mark) continue;

			let pos = mark.find();
			if (pos) {
				serialized.push(pos.from);
			}
		}
	}
	obj.invalids = serialized;
}

function loadTheme(theme) {
	if (theme) {
		themeSelector.val(theme);
		setTheme(theme);
	}
}

function saveTheme() {
	return themeSelector.val();
}

function loadCursor(obj) {
	editor.setCursor(obj && obj.cursor ? obj.cursor : getStartPos());
}

function saveCursor(obj) {
	obj.cursor = editor.getCursor();
}

function loadElapsedTime(obj) {
	if (obj && obj.elapsedTime) {
		elapsedTime = obj.elapsedTime;
	} else {
		elapsed = 0;
	}
}

function saveElapsedTime(obj) {
	obj.elapsedTime = elapsedTime;
}

function setTheme(theme) {
	if (theme != "default") {
		$("head").append(`<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.19.0/theme/${theme}.min.css">`);
	}
	editor.setOption("theme", theme);
}

function setCursor(pos) {
	editor.setCursor(pos);
	let end = getEndPos();
	if (pos.line == end.line && pos.ch == end.ch) {
		goToNextChunk();
	} else if (pos.line == 0 && pos.ch == 0) {
		goToPrevChunk();
	}
}

function updateWPM() {
	if (focused) {
		// update elapsed time
		if (!elapsedTime || isNaN(elapsedTime)) {	
			elapsedTime = Date.now() - lastStartTime;
		} else {
			elapsedTime += Date.now() - lastStartTime;
		}
		lastStartTime = Date.now();
	}

	// calculate words typed
	let typed = editor.doc.getRange({ line: 0, ch: 0 }, editor.getCursor());
	let words = typed.split(/[\s,\.]+/).length;
	
	let seconds = elapsedTime / 1000;
	let minutes = seconds / 60;
	$("#wpm").text(Math.round(words / minutes));
}

function pause() {
	focused = false;
	elapsedTime += Date.now() - lastStartTime;
	$("#paused").text("Paused");
	$("#content").addClass("paused");
}

function resume() {
	focused = true;
	lastStartTime = Date.now();
	$("#paused").text("");
	$("#content").removeClass("paused");
}

String.prototype.hasOnlyWhiteSpaceBeforeIndex = function(index) {
	return this.substring(index) == this.trim();
};

// debug helpers
function removeAllInvalids() {
	editor.operation(() => {
		for (var i = 0; i < invalids.length; i++) {
			let inner = invalids[i];
			if (inner) {
				for (var j = 0; j < invalids.length; j++) {
					let mark = inner[j];
					if (mark) {
						mark.clear();
					}
				}
			}
		}
		invalids = [];
	});
}

function goToEnd() {
	editor.setCursor(getEndPos());
	updateIncompleteMark();
	save();
}
