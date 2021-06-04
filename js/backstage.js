let productModal = '';
let delModal = '';

const app = {
  data() {
    return {
      url: 'https://vue3-course-api.hexschool.io',
      pathApi: 'toriha_vuetestapi',
      isNew: '',
      productsList: [],
      productsNum: '',
      tempProduct: {
        imagesUrl: [],
      },
    }
  },
  methods: {
    checkLogin() {              // axios check 確認登入狀態
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*\=\s*([^;]*).*$)|^.*$/, '$1');
      axios.defaults.headers.common.Authorization = token;
      axios.post(`${this.url}/api/user/check`)
        .then(res => {
          console.log('帳號認證(成功)', res);

          if(!res.data.success){
            this.swalFn(res.data.message, 'warning', 3000, '即將引導至登入畫面')
            setTimeout(() => {window.location.href='login_page.html';}, 3000)
          }
        })
        .catch(err => {
          console.dir('帳號認證(失敗)', err);
        })
    },
    getData() {                 // axios get 取得資料
      const url = `${this.url}/api/${this.pathApi}/admin/products`;
      axios.get(url)
        .then(res => {
          if(res.data.success){
            this.productsList = res.data.products;
            this.productsNum = this.productsList.length;
            console.log('取得資料(成功)', res.data.products);
            console.log('取得this資料(成功)',this.productsList);
          }else{
            console.log('取得資料(錯誤)', res.data.message);
          }
        })
        .catch(err => {
          console.dir('取得資料(失敗)', err);
        })
    },
    resetData() {               // 重新整理資料
      this.swalFn('正在重整資料', 'info')
      this.getData();
    },
    openProductModal(isNew, item) {   // 打開產品修改的視窗
      if (isNew === 'isNew'){
        this.isNew = true;
        this.tempProduct = {
          category: '請選擇分類',
          is_enabled: false,
          imageUrl: 'https://images.unsplash.com/photo-1574626003470-ac963a52dc7e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1351&q=80',
          imagesUrl: [],
        }
        productModal.show();

      }else if(isNew === 'edite'){
        this.isNew = false;
        // 使用深層拷貝，避免修改圖片但未存檔的狀況下時影響到暫存資料
        this.tempProduct = JSON.parse(JSON.stringify(item));
        if(this.tempProduct.imagesUrl === undefined){
          this.tempProduct.imagesUrl =  [];
        }
        productModal.show();
      }
    },
    updateProduct(){            // axios post/put 資料
      console.log('暫存資料', this.tempProduct);

      let url = `${this.url}/api/${this.pathApi}/admin/product`;
      let http = 'post';

      if(!this.isNew){
        url = `${this.url}/api/${this.pathApi}/admin/product/${this.tempProduct.id}`;
        http = 'put';
      }

      axios[http](url, { data: this.tempProduct })
      .then(res => {
        if(res.data.success) {
          console.log('新增/修改資料(成功)', res);
          productModal.hide();
          this.getData();
          this.swalFn(res.data.message, 'success')
          }else{
            console.log('新增/修改資料(錯誤)', res);
            this.swalFn(res.data.message, 'error', 10000)
            return;
          }
        })
        .catch(err => {
          console.dir('新增/修改資料(失敗)', err);
        })
    },
    deleteData(product) {       // 刪除產品
      const url = `${this.url}/api/${this.pathApi}/admin/product/${product.id}`;
      console.log('id', product.id);
      axios.delete(url)
        .then(res => {
          if(res.data.success) {
            console.log('刪除資料(成功)', res);
            this.swalFn(res.data.message, 'success');
            this.getData();
          }else{
            console.log('刪除資料(錯誤)', res);
            this.swalFn(res.data.message, 'error', 10000)
            return;
          }
        })
        .catch(err => {
          console.dir('刪除資料(失敗)', err);
        })
    },
    swalFn(title, icon, timer = 2000, text, button = false) {             // 一般提示視窗
      const txt = { title, text, icon, button, timer };
      swal(txt);
    },
    delSwalFn(product) {        // 刪除的確認視窗
      const txt = {
        title: `確定要刪除 [${product.title}] 嗎？`,
        text: '請注意，刪除後將無法復原！',
        icon: 'warning',
        buttons: ["取消", "確定刪除"],
        dangerMode: true,
      }
      swal(txt)
      .then(willDelete => {        // 針對選項執行不同動作
        if (willDelete) {
          this.deleteData(product);
        } else {
          this.swalFn('已取消操作', 'error', 1500);
        }
      });
    },
  },
  mounted() {
    // 定義新增/修改產品視窗的元素位置
    productModal = new bootstrap.Modal(document.querySelector('.js_productModal'));

    this.checkLogin();
    this.getData();
  }
}
Vue.createApp(app).mount('.js_backstage');