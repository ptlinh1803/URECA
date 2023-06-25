from flask import Flask,render_template,request,redirect,jsonify
import yfinance as yf
import torch
import torch.nn as nn
import os
from sklearn.preprocessing import StandardScaler, MinMaxScaler
import numpy as np
import matplotlib.pyplot as plt
from torch.autograd import Variable
from LSTM import LSTM

app = Flask(__name__)

# split a multivariate sequence past, future samples (X and y)
def split_sequences(input_sequences, output_sequence, n_steps_in, n_steps_out):
    X, y = list(), list() # instantiate X and y
    for i in range(len(input_sequences)):
        # find the end of the input, output sequence
        end_ix = i + n_steps_in
        out_end_ix = end_ix + n_steps_out - 1
        # check if we are beyond the dataset
        if out_end_ix > len(input_sequences): break
        # gather input and output of the pattern
        seq_x, seq_y = input_sequences[i:end_ix], output_sequence[end_ix-1:out_end_ix, -1]
        X.append(seq_x), y.append(seq_y)
    return np.array(X), np.array(y)


def forecast(ticker="BTC-USD",model_file_path="../models/BTC.pt"):
    input_size = 4 # number of features
    hidden_size = 2 # number of features in hidden state
    num_layers = 1 # number of stacked lstm layers
    num_classes = 50 # number of output classes 
    model = LSTM(num_classes, input_size, hidden_size, num_layers)
    model = torch.load(model_file_path)

    msft = yf.Ticker(ticker)
    df = msft.history(period="200d",interval="1d")
    # df = df[:200]
    # print(df)
    df = df.drop(['Dividends','Stock Splits'], axis=1)
    
    X,y = df.drop('Close',axis=1),df.Close.values 

    mm = MinMaxScaler()
    ss = StandardScaler()
    X_trans = ss.fit_transform(X)
    y_trans = mm.fit_transform(y.reshape(-1, 1))


    X_ss, y_mm = split_sequences(X_trans, y_trans, 100, 50)
    #  print(X_ss)

    X_tensors = Variable(torch.Tensor(X_ss))
    y_tensors = Variable(torch.Tensor(y_mm))
    #  print(len(X_tensors))
    X_tensors_final = torch.reshape(X_tensors,   
                                      (X_tensors.shape[0], 100, 
                                       X_tensors.shape[2]))

    predict = model(X_tensors_final[-1].unsqueeze(0))
    predict = predict.detach().numpy()
    predict = mm.inverse_transform(predict)
    predict = predict[0].tolist()

    target = y_tensors[-1].detach().numpy() # last sample again
    target = mm.inverse_transform(target.reshape(1, -1))
    target = target[0].tolist()

    return predict

def get_latest_close_prices(tickers):
    prices = {}
    for ticker in tickers:
        coin = yf.Ticker(ticker)
        history = coin.history(period='1d')
        latest_close_price = history['Close'].iloc[-1]
        prices[ticker] = latest_close_price
    return prices

# Define a route and its corresponding function
@app.route('/')
def main():
    return render_template('main.html')

@app.route('/main.html')
def main_click():
    return render_template('main.html')

@app.route('/predict.html')
def predict():
    return render_template('predict.html')

@app.route('/about.html')
def about():
    return render_template('about.html')

@app.route('/search.html')
def search():
    return render_template('search.html')

@app.route('/bitcoin.html')
def bitcoin():
    return render_template('bitcoin.html')

@app.route('/ethereum.html')
def eth():
    return render_template('ethereum.html')

@app.route('/solana.html')
def sol():
    return render_template('solana.html')

@app.route('/polkadot.html')
def dot():
    return render_template('polkadot.html')

@app.route('/zilliqa.html')
def zil():
    return render_template('zilliqa.html')

@app.route('/cardano.html')
def ada():
    return render_template('cardano.html')

@app.route('/data/btc_forecast' , methods = ['GET'])
def btc_forecast():
    pred_prices = forecast("BTC-USD","models/BTC.pt")
    return jsonify(pred_prices)

@app.route('/data/ada_forecast' , methods = ['GET'])
def ada_forecast():
    pred_prices = forecast("ADA-USD","models/ADA.pt")
    return jsonify(pred_prices)

@app.route('/data/eth_forecast' , methods = ['GET'])
def eth_forecast():
    pred_prices = forecast("ETH-USD","models/ETH.pt")
    return jsonify(pred_prices)

@app.route('/data/dot_forecast' , methods = ['GET'])
def dot_forecast():
    pred_prices = forecast("DOT-USD","models/DOT.pt")
    return jsonify(pred_prices)

@app.route('/data/sol_forecast' , methods = ['GET'])
def sol_forecast():
    pred_prices = forecast("SOL-USD","models/SOL.pt")
    return jsonify(pred_prices)

@app.route('/data/zil_forecast' , methods = ['GET'])
def zil_forecast():
    pred_prices = forecast("ZIL-USD","models/ZIL.pt")
    return jsonify(pred_prices)

@app.route('/data/all' , methods = ['GET'])
def all_forecast():
    tickers =  ["BTC-USD","ADA-USD","ETH-USD","DOT-USD","SOL-USD","ZIL-USD"]
    fp=["models/BTC.pt",
        "models/ADA.pt",
        "models/ETH.pt",
        "models/DOT.pt",
        "models/SOL.pt",
        "models/ZIL.pt"
        ]

    pred_prices  =  []
    for t,f in zip(tickers,fp):
        pred = {t:forecast(t,f)}
        pred_prices.append(pred)


    return jsonify(pred_prices)

@app.route('/latest_prices', methods=['GET'])
def latest_prices():
    tickers = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'ADA-USD', 'DOT-USD', 'ZIL-USD']  # Add or remove tickers as needed
    latest_prices = get_latest_close_prices(tickers)
    return jsonify(latest_prices)

# Run the Flask application
if __name__ == '__main__':
    app.run(debug=True)