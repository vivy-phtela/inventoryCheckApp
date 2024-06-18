from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///items.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Item(db.Model): # 項目
    id = db.Column(db.Integer, primary_key=True)
    item = db.Column(db.String(30), nullable=False)
    unit1 = db.Column(db.String(30), nullable=False)
    unit2 = db.Column(db.String(30), nullable=True) # nullを許容

class StockHistory(db.Model): # 在庫履歴
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey('item.id'), nullable=False) # itemテーブルのidを外部キーとして持つ
    stock = db.Column(db.Integer, nullable=False)
    unit = db.Column(db.String(50), nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    item = db.relationship('Item', backref=db.backref('stock_history', lazy=True)) # itemテーブルとのリレーション

@app.route('/items', methods=['GET'])
def get_items(): # 全ての項目を取得
    items = Item.query.all()
    return jsonify([{'id': item.id, 'item': item.item, 'unit1': item.unit1, 'unit2': item.unit2} for item in items])

@app.route('/items', methods=['POST'])
def add_item(): # 項目を追加
    data = request.get_json()
    new_item = Item(
        item=data['item'],
        unit1=data.get('unit1', ''),
        unit2=data.get('unit2', '') if data.get('unit2', '') != '' else None # unit2が空文字の場合はnullに
    )
    db.session.add(new_item)
    db.session.commit()
    return jsonify({'message': 'Item added successfully'})

@app.route('/stocks/<int:item_id>', methods=['GET'])
def get_stock_history(item_id): # 在庫履歴を取得
    unit1_history = StockHistory.query.filter_by(item_id=item_id, unit='unit1').order_by(StockHistory.date.desc()).limit(3).all() # 3つの最新の在庫履歴を取得
    unit2_history = StockHistory.query.filter_by(item_id=item_id, unit='unit2').order_by(StockHistory.date.desc()).limit(3).all()
    return jsonify({
        'unit1_history': [{'stock': sh.stock, 'date': sh.date} for sh in unit1_history],
        'unit2_history': [{'stock': sh.stock, 'date': sh.date} for sh in unit2_history]
    })

@app.route('/stocks', methods=['POST'])
def add_stock(): # 在庫数を追加
    data = request.get_json()
    new_stock = StockHistory(
        item_id=data['item_id'], 
        stock=data['stock'], 
        unit=data['unit']
    )
    db.session.add(new_stock)
    db.session.commit()
    return jsonify({'message': 'Stock added successfully'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)
